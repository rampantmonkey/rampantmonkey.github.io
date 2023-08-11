:title Modeling a Resource Pool
:description Redesigning a service with TLA+.
:date 2020-01-09

During a hackathon at work I took the opportunity to use TLA+[^1] to model one of our services.
After modeling this service I found a correctness bug, which led to a new design and a second model which upholds the desired invariant.

First some background on the service.
This service is responsible for providing access tokens to one of our vendors.
We pre-pay for a fixed number of tokens in use concurrently.
If we go over this limit we will be billed for the excess.
This provides our invariant: the system must ensure that we never exceed the initial allocation.

Great start.
I found a concurrent system which has an easily statable goal.
Now to model the existing implementation and see if it works.
(If you want to skip ahead you can find the full model here.[^2])

I began by defining the module and setting up a few constants.

- `MaxTokens`, the number of tokens we pay for.
- `Instances`, a set[^3] where each member represents an individual running instance of the service.

        ------------------------ MODULE ExistingService ------------------------
        EXTENDS Integers
        CONSTANTS MaxTokens, Instances

        ASSUME MaxTokens > 0
        ASSUME Instances /= {}
        ========================================================================

Next up, defining the invariant.
This required defining two global variables to represent the external state of our vendor; the number of tokens fetched and the number of tokens returned.

        (*--algorithm tokensWithLock
        variables
            token_fetch_count = 0,
            token_return_count = 0;

        define
            MaxTokensNotExceeded == MaxTokens >= token_fetch_count - token_return_count
        end define;
        end algorithm;*)

Each instance of the is essentially an infinite loop which does one of two things on each iteration: fetch a new token, or return a used token.
This can be directly modeled with a `process` and trivial implementations of fetch and return.

        process instance \in Instances
        begin
            InstanceLoop:
                while TRUE do
                    either
                        FetchToken:
                            token_fetch_count := token_fetch_count + 1;
                    or
                        ReturnToken:
                            token_return_count := token_return_count + 1;
                    end either;
                end while;
        end process;

At this point we have a specification that can be evaluated with `tlc`.
`Invariant MaxTokensNotExceeded is violated.`, this was expected since the specification allocates new tokens without considering how many tokens have been fetched or returned yet.

To coordinate access, the existing implementation uses redlock to create a shared lock inside of Redis.
Let's add the lock into our specification and see what happens.[^4]

        process instance \in Instances
        variable has_lock = FALSE;
        begin
            InstanceLoop:
                while TRUE do
                    either
                        FetchToken:
                            GetLock:
                                has_lock := TRUE;
                            GetToken:
                                if MaxTokens - token_fetch_count + token_return_count > 1 then
                                token_fetch_count := token_fetch_count + 1;
                                end if;
                            ReleaseLock:
                                has_lock := FALSE;
                    or
                        ReturnToken:
                            \* Returning the same token multiple times is fine.
                            \* So rather than modeling the individual tokens, just enforce this invariant with an if statment.
                            if token_return_count < token_fetch_count then
                                token_return_count := token_return_count + 1;
                            end if;
                    end either;
                end while;
        end process;

This is the fundamental error inside of the existing implementation.
Redlock uses a timeout to ensure liveness since it is designed to reduce resource contention not correctness.
Therefore we need something with a stronger guarantee.

For this new version, I introduced the concept of a 'lease' to represent the number of outstanding token requests and use this when deciding whether it is possible to fetch a token or not.
In the spec, which can be found here[^5], the lease was implemented as another global variable `outstanding_fetches`.
This was then implemented with Lua inside of Redis.

Now our token service guarantees that we always stay below our prepaid limit.
And we demonstrated this behavior using TLA+ without writing any code.
I look forward to the next project I can use TLA+ with to help guide the design.

[^1]: Well, technically PlusCal.
[^2]: The full specification of the existing service including the translation to TLA+, [ExistingService.tla](https://rampantmonkey.com/2020/01/modeling-a-resource-pool/ExistingService.tla)
[^3]: A symmetry set of model values to reduce `tlc`'s search space.
[^4]: Since we are already coordinating access, we can also keep track of the number of requests that have been made and therefore use `token_fetch_count` and `token_return_count` in our process's logic.
[^5]: The full specification of the updated service including the translation to TLA+, [UpdatedService.tla](https://rampantmonkey.com/2020/01/modeling-a-resource-pool/UpdatedService.tla)
