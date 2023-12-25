% https://www.brainzilla.com/logic/zebra/fancy-hotels/

/*
   - The biggest hotel is somewhere between the Palace Hotel and the hotel that has 150 rooms, in that order.
   - In the second position is the hotel founded in the 30s.
   - The White hotel is somewhere to the left of the smallest hotel.
   - In the middle is the hotel owned by the German.
   - The hotel owned by the American is somewhere between the hotel that has 250 rooms and the White hotel, in that order.
   - Roger manages the Red hotel.
   - The Seashore Hotel has 300 rooms.
   - The Vortex Hotel is somewhere to the right of the Green hotel.
   - The Italian built his hotel in the 50s.
   - The hotel that has 250 rooms is exactly to the left of the hotel managed by Roger.
   - At the first position is the hotel whose the owner was born in Paris.
   - The Green hotel is somewhere to the left of the hotel that has 200 rooms.
   - Ian works at the first hotel.
   - The Royal Hotel is somewhere between the hotel owned by the French and the Mirage Hotel, in that order.
   - The Italian owns the fourth hotel.
   - The Royal Hotel is White.
   - Calvin manages the fourth hotel.
   - The Green hotel is somewhere to the left of the hotel founded right after World War II ended.
   - The White hotel is next to the hotel founded in the 30s.
   - The hotel managed by Calvin is somewhere between the Blue hotel and the hotel managed by Derrick, in that order.
   - At the third position is the hotel founded when The Great Depression started.
*/

include "globals.mzn";

set of int: HOTEL = 1..5;

array[1..5] of var 1..5: Color;
var int: blue;
var int: green;
var int: purple;
var int: red;
var int: white;

array[1..5] of var 1..5: Name;
var int: mirage;
var int: palace;
var int: royal;
var int: seashore;
var int: vortex;

array[1..5] of var 1..5: Owner;
var int: american;
var int: british;
var int: french;
var int: german;
var int: italian;

array[1..5] of var 1..5: Manager;
var int: calvin;
var int: derrick;
var int: ian;
var int: roger;
var int: wesley;

array[1..5] of var 1..5: Room;
var int: r100;
var int: r150;
var int: r200;
var int: r250;
var int: r300;

array[1..5] of var 1..5: Founded;
var int: y1910s;
var int: y1920s;
var int: y1930s;
var int: y1940s;
var int: y1950s;

constraint
  inverse(Color,[blue, green, purple, red, white]) /\
  inverse(Name,[mirage, palace, royal, seashore, vortex]) /\
  inverse(Owner,[american, british, french, german, italian]) /\
  inverse(Manager, [calvin, derrick, ian, roger, wesley]) /\
  inverse(Room, [r100, r150, r200, r250, r300]) /\
  inverse(Founded, [y1910s, y1920s, y1930s, y1940s, y1950s]) /\

  palace < r300 /\ r300 < r150        /\ % The biggest hotel is somewhere between the Palace Hotel and the hotel that has 150 rooms, in that order.
  y1930s = 2                          /\ % In the second position is the hotel founded in the 30s.
  white < r100                        /\ % The White hotel is somewhere to the left of the smallest hotel.
  german = 3                          /\ % In the middle is the hotel owned by the German.
  r250 < american /\ american < white /\ % The hotel owned by the American is somewhere between the hotel that has 250 rooms and the White hotel, in that order.
  roger = red                         /\ % Roger manages the Red hotel.
  seashore = y1930s                   /\ % The Seashore Hotel has 300 rooms.
  vortex > green                      /\ % The Vortex Hotel is somewhere to the right of the Green hotel.
  italian = y1950s                    /\ % The Italian built his hotel in the 50s.
  r250 = roger - 1                    /\ % The hotel that has 250 rooms is exactly to the left of the hotel managed by Roger.
  french = 1                          /\ % At the first position is the hotel whose the owner was born in Paris.
  green < r200                        /\ % The Green hotel is somewhere to the left of the hotel that has 200 rooms.
  ian = 1                             /\ % Ian works at the first hotel.
  french < royal /\ royal < mirage    /\ % The Royal Hotel is somewhere between the hotel owned by the French and the Mirage Hotel, in that order.
  italian = 4                         /\ % The Italian owns the fourth hotel.
  royal = white                       /\ % The Royal Hotel is White.
  calvin = 4                          /\ % Calvin manages the fourth hotel.
  green < y1940s                      /\ % The Green hotel is somewhere to the left of the hotel founded right after World War II ended.
  abs(white - y1930s) = 1             /\ % The White hotel is next to the hotel founded in the 30s.
  blue < calvin /\ calvin < derrick   /\ % The hotel managed by Calvin is somewhere between the Blue hotel and the hotel managed by Derrick, in that order.
  y1920s = 3                             % At the third position is the hotel founded when The Great Depression started.
;

solve satisfy;

output
[
"color:   ", show([blue,green,purple,red,white]), "\n",
"name:    ", show([mirage,palace,royal,seashore,vortex]), "\n",
"owner:   ", show([american,british,french,german,italian]), "\n",
"manager: ", show([calvin,derrick,ian,roger,wesley]), "\n",
"room:    ", show([r100,r150,r200,r250,r300]), "\n",
"founded: ", show([y1910s,y1920s,y1930s,y1940s,y1950s]), "\n",
];

