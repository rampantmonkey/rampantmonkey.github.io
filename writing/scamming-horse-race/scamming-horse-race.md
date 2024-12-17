The Genius Season 1 Episode 5

Scamming Horse race was the main match.

The goal here was to predict which horse would win a predetermined race. The only information you have is a) the horses position after each round, b) the tokens other players have bet, and c) a singular hint you were given at the start of the game.

Place tokens to bet on a particular horse. The more tokens on a position, the less it is worth.

If you share clues you can figure out the entire order of the race.

The social aspect is quite hard to model. I'm mostly interested in how do you construct the clues to give everyone soem information. And are there small clusters of clues that are more powerful together than others.

Data originally gathered from https://the-genius.fandom.com/wiki/Scamming_Horse_Race#Hints

TODO: Also need to investigate how Eunji's deception impacts the odds of getting the right answer.
TODO: Get the original hangul here as well.

Hints:

- Kim Poong -> The horse in 1st place in the 9th round finishes 1st.
- Lee Sangmin -> The numbers of 1st + 2nd + 3rd horses = 12.
- Kim Sungkyu -> Horse 7 finishes after horse 1.
- Choi Jungmoon -> Horse 8 is slower than horse 3.
- Hong Jinho -> Horse 6 finishes right after horse 4.
- Cha Yuram -> Horse 1 is in the top 3.
- Horse 5 can't beat horse 3.
- Horse 2 is faster than horse 5, but slower than horse 4.
- 1st and 2nd place have higher numbers than 3rd place.

Additional Hints:
- Kim Sungkyu Horse 6 is 6th


Horse Movements:
	R1	R2	R3	R4	R5	R6	R7	R8	R9	R10	R11	R12	Place
H1	2	2	3	1	1	3	1	0	2	2	2	0	3rd
H2	1	1	0	1	1	1	1	3	1	1	1	3	7th
H3	1	1	1	3	3	1	2	1	2	2	3	-	1st
H4	2	1	3	3	0	1	1	3	0	1	1	1	5th
H5	1	1	1	1	3	1	1	1	1	1	1	1	8th
H6	1	1	2	0	1	1	1	1	2	3	3	0	6th
H7	3	1	1	3	1	0	1	2	1	1	1	3	4th
H8	2	1	1	1	1	2	2	1	2	1	3	3	2nd