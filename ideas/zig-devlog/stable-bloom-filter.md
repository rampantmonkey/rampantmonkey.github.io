:title Devlog Season One Episode Three: Stable Bloom Filter
:description devlog season one episode three
:date 2025-01-20
:slug stable-bloom-filter
:category Devlog Season One

Want to know if something is a member of a set without exhaustively checking every member?
Bloom filters can help.
Bloom filters are a data structure which answer the set membership question approximately in constant time with constant memory usage.
False positives are allowed, while false negatives are not.
This constraint means that the size of the dataset must be known a priori when constructing a bloom filter.

Stable bloom filters take this concept a step further.
What if we also allow false negatives?
Then we can have an unbounded data set size while still retaining the constant query and member addition of a bloom filter.
A decent tradeoff for streaming data pipelines.

So how do we build one with zig?

Bloom filters are a data structure which answ

Stable bloom filters are an algorithm for detecting duplicates in a stream of data.

[Approximately Detecting Duplicates for Streaming Data
using Stable Bloom Filters (pdf)](https://webdocs.cs.ualberta.ca/~drafiei/papers/DupDet06Sigmod.pdf)