:title Evolutionary Sorting
:description Using an evolutionary algorithm to sort an array
:slug evolutionary-sorting

Let's use sorting an array as a simple example (though you usually only go for evolutionary algorithms when there isn't an obvious imperative algorithm).

1. Start with the initial array to be sorted
2. Generate a population of candidates by copying and mutating the array (e.g. swap two arbitrary elements)
3. Evaluate which array is lcosest to sorted (e.g. count percentage of elements which are less than the next element in the array)
4. Pick candidate with best score from (3)
5. Repeat with chosen candidate as new initial array until you have reached the maximum score.

Exactly like the evolution process form biology.

