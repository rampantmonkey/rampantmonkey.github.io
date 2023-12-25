------------------------ MODULE UpdatedService ------------------------
EXTENDS Integers
CONSTANTS MaxTokens, Instances, FetchIncrement

ASSUME MaxTokens > 0
ASSUME FetchIncrement \in 0..MaxTokens
ASSUME Instances /= {}

(*--algorithm tokenService
variables
    outstanding_fetches = 0,
    token_fetch_count = 0,
    token_return_count = 0;

define
    MaxTokensNotExceeded == MaxTokens >= token_fetch_count - token_return_count
end define;

process instance \in Instances
variable budget = 0;
begin
    InstanceLoop:
        while TRUE do
            either
                FetchToken:
                    \* How many tokens am I allowed to fetch now?
                    if budget = 0 then
                        if MaxTokens - outstanding_fetches - token_fetch_count + token_return_count > FetchIncrement then
                            outstanding_fetches := outstanding_fetches + FetchIncrement;
                            budget := budget + FetchIncrement;
                        end if;
                    else
                        \* Fetch a token
                        token_fetch_count := token_fetch_count + 1;
                        budget := budget - 1;
                        outstanding_fetches := outstanding_fetches - 1;
                    end if;
            or
                ReturnToken:
                    \* Returning the same token multiple times is fine.
                    \* So rather than modeling the individual tokens, just enforce the invariant with an if statment.
                    if token_return_count < token_fetch_count then
                        token_return_count := token_return_count + 1;
                    end if;
            end either;
        end while;
end process;

end algorithm;*)
\* BEGIN TRANSLATION
VARIABLES outstanding_fetches, token_fetch_count, token_return_count, pc

(* define statement *)
MaxTokensNotExceeded == MaxTokens >= token_fetch_count - token_return_count

VARIABLE budget

vars == << outstanding_fetches, token_fetch_count, token_return_count, pc,
           budget >>

ProcSet == (Instances)

Init == (* Global variables *)
        /\ outstanding_fetches = 0
        /\ token_fetch_count = 0
        /\ token_return_count = 0
        (* Process instance *)
        /\ budget = [self \in Instances |-> 0]
        /\ pc = [self \in ProcSet |-> "InstanceLoop"]

InstanceLoop(self) == /\ pc[self] = "InstanceLoop"
                      /\ \/ /\ pc' = [pc EXCEPT ![self] = "FetchToken"]
                         \/ /\ pc' = [pc EXCEPT ![self] = "ReturnToken"]
                      /\ UNCHANGED << outstanding_fetches, token_fetch_count,
                                      token_return_count, budget >>

FetchToken(self) == /\ pc[self] = "FetchToken"
                    /\ IF budget[self] = 0
                          THEN /\ IF MaxTokens - outstanding_fetches - token_fetch_count + token_return_count > FetchIncrement
                                     THEN /\ outstanding_fetches' = outstanding_fetches + FetchIncrement
                                          /\ budget' = [budget EXCEPT ![self] = budget[self] + FetchIncrement]
                                     ELSE /\ TRUE
                                          /\ UNCHANGED << outstanding_fetches,
                                                          budget >>
                               /\ UNCHANGED token_fetch_count
                          ELSE /\ token_fetch_count' = token_fetch_count + 1
                               /\ budget' = [budget EXCEPT ![self] = budget[self] - 1]
                               /\ outstanding_fetches' = outstanding_fetches - 1
                    /\ pc' = [pc EXCEPT ![self] = "InstanceLoop"]
                    /\ UNCHANGED token_return_count

ReturnToken(self) == /\ pc[self] = "ReturnToken"
                     /\ IF token_return_count < token_fetch_count
                           THEN /\ token_return_count' = token_return_count + 1
                           ELSE /\ TRUE
                                /\ UNCHANGED token_return_count
                     /\ pc' = [pc EXCEPT ![self] = "InstanceLoop"]
                     /\ UNCHANGED << outstanding_fetches, token_fetch_count,
                                     budget >>

instance(self) == InstanceLoop(self) \/ FetchToken(self)
                     \/ ReturnToken(self)

Next == (\E self \in Instances: instance(self))

Spec == Init /\ [][Next]_vars

\* END TRANSLATION
===========================================================================
