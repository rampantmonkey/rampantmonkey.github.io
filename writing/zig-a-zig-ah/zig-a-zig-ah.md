:title Devlog Season One Episode One: Zig-a-zig-ah
:description devlog season one episode one
:date 2025-01-18
:slug zig-a-zig-ah
:category Devlog Season One

The first decade of my career has been spent on many different parts of the stack in many different programming languages.
Pushing myself even further with my side projects.
While this approach exposed me to many different ideas, languages, and problem domains all of my knowledge is in my head or this site.
There are no reusable components or tools leaving every project starting from scratch.
Time to explore the tradeoffs of a new approach.

Build my own foundation of data structures, libraries, and abstractions to tackle the next set of adventures.
And document it live on this site, devlog season one.

Now to select a language[^1].
The primary criteria is "do I enjoy using this language" with a secondary criteria of "will it be flexible enough to fit my ever changing objectives".
I'm not going to pretend that this is an objective decision, but I'll attempt to break down "enjoy" a bit more.

* A language needs to have enough concurrency support to take advantage of more than a dozen cpu cores.
* I need to be able to express the abstractions I want to make within the language. Some counter-examples to provide a bit more color. Building self-referential data structures in Rust is impossible[^2] without `unsafe` due to the borrow checker omnipresence. Typescript structural typing is great for documentation and provides minimal guarantees of correctness.
* I want my projects to run somewhere beyond my laptop. Creating a self-contained deployable artifact (not a container) is mandatory. Bonus points for cross compiling to different operating systems or cpu architectures.
* Many of the tools[^3] I enjoy using are embeddable with a C api, or accept plugins with a CFFI. Participating in that ecosystem without constantly writing (or worse, generating, _shudder_) wrappers is enjoyable.
* Avoiding dread. Nothing kills my motivation faster than something tedious I dread dealing with. Go explicitly handling errors at every call site, compiling C or C++ with more than one library, watching the 900th package download from npm, or waiting for ghc to finish compiling all lead to dread.

With these criteria in mind I started writing down programming languages that I have used for something and didn't immediately regret.
Julia, Common Lisp, Python, Prolog, Idris, JavaScript, Janet, OCaml, Haskell, Zig.
I stopped once I wrote down zig.
Zig excites me and it is hard to explain why.
Answering that will be the "B" plot this season.

Next time on devlog: setting up the development environment and starting the first project.

[^1]: I'm not going to write my own. I need to leave something for next season.
[^2]: You can technically build a graph with a `Vec` of objects and use the index/offset as a "pointer". That ends up being unreadable and less safe than `unsafe`.
[^3]: [SWI-Prolog](https://www.swi-prolog.org/pldoc/man?section=embedded), [MiniZinc](https://github.com/MiniZinc/libminizinc), [Opencascade](https://github.com/Open-Cascade-SAS/OCCT), [Nginx](https://nginx.org/en/docs/dev/development_guide.html#Modules), [Redis](https://redis.io/docs/latest/develop/reference/modules/), [SQLite](https://www.sqlite.org/cintro.html) to name a few.