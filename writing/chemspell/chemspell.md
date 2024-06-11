:title Chemspell
:description Spelling words with atomic symbols
:date 2022-01-07
:slug chemspell
:category Puzzling

During a recent [puzzle writing](/puzzling) session I was looking for a new mechanic to build the next puzzle around.
I remembered sitting in chemistry class and staring at the periodic table on the wall.
I would spend the entire lecture attempting to spell words using the atomic symbols.
Despite frequently getting stuck due to the lack of 'e's it was a fun activity - the primary criteria for puzzle mechanics.
So I decided to build a tool to generate the spellings.

<div id="chemspell" class="widget"></div>

How does it work?
Step one gather the data.
✓

    var elements = [
      [1  , "H" , "Hydrogen"     ],
      [2  , "He", "Helium"       ],
      [3  , "Li", "Lithium"      ],
      [4  , "Be", "Beryllium"    ],
      [5  , "B" , "Boron"        ],
      [6  , "C" , "Carbon"       ],
      [7  , "N" , "Nitrogen"     ],
      [8  , "O" , "Oxygen"       ],
      [9  , "F" , "Fluorine"     ],
      [10 , "Ne", "Neon"         ],
      [11 , "Na", "Sodium"       ],
      [12 , "Mg", "Magnesium"    ],
      [13 , "Al", "Aluminum"     ],
      [14 , "Si", "Silicon"      ],
      [15 , "P" , "Phosphorus"   ],
      [16 , "S" , "Sulfur"       ],
      [17 , "Cl", "Chlorine"     ],
      [18 , "Ar", "Argon"        ],
      [19 , "K" , "Potassium"    ],
      [20 , "Ca", "Calcium"      ],
      [21 , "Sc", "Scandium"     ],
      [22 , "Ti", "Titanium"     ],
      [23 , "V" , "Vanadium"     ],
      [24 , "Cr", "Chromium"     ],
      [25 , "Mn", "Manganese"    ],
      [26 , "Fe", "Iron"         ],
      [27 , "Co", "Cobalt"       ],
      [28 , "Ni", "Nickel"       ],
      [29 , "Cu", "Copper"       ],
      [30 , "Zn", "Zinc"         ],
      [31 , "Ga", "Gallium"      ],
      [32 , "Ge", "Germanium"    ],
      [33 , "As", "Arsenic"      ],
      [34 , "Se", "Selenium"     ],
      [35 , "Br", "Bromine"      ],
      [36 , "Kr", "Krypton"      ],
      [37 , "Rb", "Rubidium"     ],
      [38 , "Sr", "Strontium"    ],
      [39 , "Y" , "Yttrium"      ],
      [40 , "Zr", "Zirconium"    ],
      [41 , "Nb", "Niobium"      ],
      [42 , "Mo", "Molybdenum"   ],
      [43 , "Tc", "Technetium"   ],
      [44 , "Ru", "Ruthenium"    ],
      [45 , "Rh", "Rhodium"      ],
      [46 , "Pd", "Palladium"    ],
      [47 , "Ag", "Silver"       ],
      [48 , "Cd", "Cadmium"      ],
      [49 , "In", "Indium"       ],
      [50 , "Sn", "Tin"          ],
      [51 , "Sb", "Antimony"     ],
      [52 , "Te", "Tellurium"    ],
      [53 , "I" , "Iodine"       ],
      [54 , "Xe", "Xenon"        ],
      [55 , "Cs", "Cesium"       ],
      [56 , "Ba", "Barium"       ],
      [57 , "La", "Lanthanum"    ],
      [58 , "Ce", "Cerium"       ],
      [59 , "Pr", "Praseodymium" ],
      [60 , "Nd", "Neodymium"    ],
      [61 , "Pm", "Promethium"   ],
      [62 , "Sm", "Samarium"     ],
      [63 , "Eu", "Europium"     ],
      [64 , "Gd", "Gadolinium"   ],
      [65 , "Tb", "Terbium"      ],
      [66 , "Dy", "Dysprosium"   ],
      [67 , "Ho", "Holmium"      ],
      [68 , "Er", "Erbium"       ],
      [69 , "Tm", "Thulium"      ],
      [70 , "Yb", "Ytterbium"    ],
      [71 , "Lu", "Lutetium"     ],
      [72 , "Hf", "Hafnium"      ],
      [73 , "Ta", "Tantalum"     ],
      [74 , "W" , "Tungsten"     ],
      [75 , "Re", "Rhenium"      ],
      [76 , "Os", "Osmium"       ],
      [77 , "Ir", "Iridium"      ],
      [78 , "Pt", "Platinum"     ],
      [79 , "Au", "Gold"         ],
      [80 , "Hg", "Mercury"      ],
      [81 , "Tl", "Thallium"     ],
      [82 , "Pb", "Lead"         ],
      [83 , "Bi", "Bismuth"      ],
      [84 , "Po", "Polonium"     ],
      [85 , "At", "Astatine"     ],
      [86 , "Rn", "Radon"        ],
      [87 , "Fr", "Francium"     ],
      [88 , "Ra", "Radium"       ],
      [89 , "Ac", "Actinium"     ],
      [90 , "Th", "Thorium"      ],
      [91 , "Pa", "Protactinium" ],
      [92 , "U" , "Uranium"      ],
      [93 , "Np", "Neptunium"    ],
      [94 , "Pu", "Plutonium"    ],
      [95 , "Am", "Americium"    ],
      [96 , "Cm", "Curium"       ],
      [97 , "Bk", "Berkelium"    ],
      [98 , "Cf", "Californium"  ],
      [99 , "Es", "Einsteinium"  ],
      [100, "Fm", "Fermium"      ],
      [101, "Md", "Mendelevium"  ],
      [102, "No", "Nobelium"     ],
      [103, "Lr", "Lawrencium"   ],
      [104, "Rf", "Rutherfordium"],
      [105, "Db", "Dubnium"      ],
      [106, "Sg", "Seaborgium"   ],
      [107, "Bh", "Bohrium"      ],
      [108, "Hs", "Hassium"      ],
      [109, "Mt", "Meitnerium"   ],
      [110, "Ds", "Darmstadtium" ],
      [111, "Rg", "Roentgenium"  ],
      [112, "Cn", "Copernicium"  ],
      [113, "Nh", "Nihonium"     ],
      [114, "Fl", "Flerovium"    ],
      [115, "Mc", "Moscovium"    ],
      [116, "Lv", "Livermorium"  ],
      [117, "Ts", "Tennessine"   ],
      [118, "Og", "Oganesson"    ]
    ].map(([num, symbol, name]) => {
      return {number: num, symbol, name};
    });

Step 2, generate all possible ways to partition the target word.
Atomic symbols are either one or two letters long, thus determining our partition sizes.
There are two approaches we can take here, the clever one or the lazy one.
The clever approach would be to dynamically build a directed, acyclic graph of potential spellings similar to a trie or regular expression.
While this is an intellectually interesting exercise, in the amount of time it would take to write that code I could run the lazy approach for the entire dictionary and get back to the puzzle writing.
So let's do that instead.

The lazy approach, generate all possible partitions and toss out the ones that do not add up to the correct length.
This ends up being a crossproduct and filter.[^1]

    const product = (it, repeat) => {
      let argv = Array.prototype
                      .slice
                      .call(arguments)
      let argc = argv.length
      if (argc === 2
       && !isNaN(argv[argc - 1])) {
        var copies = [];
        for(let i = 0; i < repeat; i++){
          copies.push(argv[0].slice())
        }
        argv = copies
      }
      return argv.reduce((acc, v) => {
        let tmp = []
        acc.forEach((a0) => {
          v.forEach((a1) => {
            tmp.push(a0.concat(a1))
          })
        })
        return tmp
      }, [[]])
    }

    const generatePartitions = (() => {
      let memo = {}
      return (wordlength) => {
        if(wordlength in memo) {
          return memo[wordlength]
        }
        let result = []
        for(var i=1; i<=wordlength; i++){
          result = result.concat(
            product([1,2], i)
              .filter(g =>
                g.reduce(
                  (acc, el) => acc+el, 0)
                == wordlength))
        }
        memo[wordlength] = result
        return result
      }
    })()

Next we filter the generated partions by slicing the word and checking that each substring is an atomic symbol.
The filtered partitions are the possible spellings.
If no partitions survive the filter, the word is not spellable.

And now for some fun facts I discovered while experimenting with chemspell.

Fifteen, or 12.71%, of the elements are spellable - Carbon, Neon, Silicon, Phosphorus, Iron, Copper, Arsenic, Krypton, Silver, Tin, Xenon, Bismuth, Astatine, Tennessine, and Oganesson.
Of these, Phosphorus has the most potential spellings with six ([P,H,Os,P,Ho,Ru,S], [P,Ho,S,P,Ho,Ru,S], [P,H,O,S,P,Ho,Ru,S], [P,H,Os,P,H,O,Ru,S], [P,Ho,S,P,H,O,Ru,S], [P,H,O,S,P,H,O,Ru,S]).

Of the 607,486 words in my computer's dictionary 85,139, or 14.01% are spellable.
'innocuousnesses' has the most potential spellings with 48.
Try it above for the full list.

If Wheel of Fortune were to create a special episode where all puzzles are spellable with atomic symbols they would provide `Sulphur, Nitrogen, Carbon, Phosphorus, Hydrogen, and Oxygen` instead of `RSTLN E`.
To maximize your odds of revealing part of the puzzle you should pick `Boron, Flourine, Potassium, and Iodine`.
Or if you would like to pick a more creative strategy, here is the normalized heatmap.

<ol class="periodic-table"><li style="background-color:rgb(89, 158, 141)">H</li><li style="background-color:rgb(115, 142, 115)">He</li><li style="background-color:rgb(104, 149, 126)">Li</li><li style="background-color:rgb(122, 137, 108)">Be</li><li style="background-color:rgb(97, 153, 133)">B</li><li style="background-color:rgb(82, 163, 148)">C</li><li style="background-color:rgb(80, 164, 150)">N</li><li style="background-color:rgb(78, 165, 152)">O</li><li style="background-color:rgb(98, 152, 132)">F</li><li style="background-color:rgb(102, 150, 128)">Ne</li><li style="background-color:rgb(114, 142, 116)">Na</li><li style="background-color:rgb(196, 90, 34)">Mg</li><li style="background-color:rgb(96, 154, 134)">Al</li><li style="background-color:rgb(119, 139, 111)">Si</li><li style="background-color:rgb(86, 160, 144)">P</li><li style="background-color:rgb(78, 166, 153)">S</li><li style="background-color:rgb(127, 134, 103)">Cl</li><li style="background-color:rgb(102, 150, 128)">Ar</li><li style="background-color:rgb(101, 150, 129)">K</li><li style="background-color:rgb(112, 144, 118)">Ca</li><li style="background-color:rgb(133, 130, 97)">Sc</li><li style="background-color:rgb(95, 155, 135)">Ti</li><li style="background-color:rgb(103, 149, 127)">V</li><li style="background-color:rgb(121, 138, 109)">Cr</li><li style="background-color:rgb(146, 122, 84)">Mn</li><li style="background-color:rgb(131, 132, 99)">Fe</li><li style="background-color:rgb(115, 141, 115)">Co</li><li style="background-color:rgb(118, 140, 112)">Ni</li><li style="background-color:rgb(130, 132, 100)">Cu</li><li style="background-color:#d45113">Zn</li><li style="background-color:rgb(124, 136, 106)">Ga</li><li style="background-color:rgb(112, 144, 118)">Ge</li><li style="background-color:rgb(116, 141, 114)">As</li><li style="background-color:rgb(108, 146, 122)">Se</li><li style="background-color:rgb(126, 134, 104)">Br</li><li style="background-color:rgb(161, 113, 69)">Kr</li><li style="background-color:rgb(139, 126, 91)">Rb</li><li style="background-color:rgb(189, 95, 41)">Sr</li><li style="background-color:rgb(94, 155, 136)">Y</li><li style="background-color:rgb(212, 81, 19)">Zr</li><li style="background-color:rgb(160, 113, 70)">Nb</li><li style="background-color:rgb(113, 143, 117)">Mo</li><li style="background-color:rgb(134, 130, 96)">Tc</li><li style="background-color:rgb(127, 134, 103)">Ru</li><li style="background-color:rgb(145, 123, 85)">Rh</li><li style="background-color:rgb(181, 100, 49)">Pd</li><li style="background-color:rgb(122, 137, 108)">Ag</li><li style="background-color:rgb(192, 93, 38)">Cd</li><li style="background-color:rgb(113, 143, 117)">In</li><li style="background-color:rgb(144, 123, 86)">Sn</li><li style="background-color:rgb(177, 102, 53)">Sb</li><li style="background-color:rgb(97, 153, 133)">Te</li><li style="background-color:rgb(79, 165, 151)">I</li><li style="background-color:rgb(151, 119, 79)">Xe</li><li style="background-color:rgb(157, 115, 73)">Cs</li><li style="background-color:rgb(121, 138, 109)">Ba</li><li style="background-color:rgb(103, 149, 127)">La</li><li style="background-color:rgb(110, 145, 120)">Ce</li><li style="background-color:rgb(114, 142, 116)">Pr</li><li style="background-color:rgb(110, 145, 120)">Nd</li><li style="background-color:rgb(189, 95, 41)">Pm</li><li style="background-color:rgb(115, 142, 115)">Sm</li><li style="background-color:rgb(141, 125, 89)">Eu</li><li style="background-color:rgb(171, 106, 59)">Gd</li><li style="background-color:rgb(155, 117, 75)">Tb</li><li style="background-color:rgb(135, 129, 95)">Dy</li><li style="background-color:rgb(123, 137, 107)">Ho</li><li style="background-color:rgb(89, 158, 141)">Er</li><li style="background-color:rgb(165, 110, 65)">Tm</li><li style="background-color:rgb(171, 106, 59)">Yb</li><li style="background-color:rgb(123, 137, 107)">Lu</li><li style="background-color:rgb(201, 87, 29)">Hf</li><li style="background-color:rgb(107, 147, 123)">Ta</li><li style="background-color:rgb(107, 147, 123)">W</li><li style="background-color:rgb(97, 153, 133)">Re</li><li style="background-color:rgb(127, 134, 103)">Os</li><li style="background-color:rgb(126, 135, 104)">Ir</li><li style="background-color:rgb(128, 134, 102)">Pt</li><li style="background-color:rgb(132, 131, 98)">Au</li><li style="background-color:rgb(196, 90, 34)">Hg</li><li style="background-color:rgb(129, 133, 101)">Tl</li><li style="background-color:rgb(176, 103, 54)">Pb</li><li style="background-color:rgb(130, 132, 100)">Bi</li><li style="background-color:rgb(127, 134, 103)">Po</li><li style="background-color:rgb(105, 148, 125)">At</li><li style="background-color:rgb(126, 135, 104)">Rn</li><li style="background-color:rgb(140, 126, 90)">Fr</li><li style="background-color:rgb(102, 150, 128)">Ra</li><li style="background-color:rgb(115, 142, 115)">Ac</li><li style="background-color:rgb(111, 144, 119)">Th</li><li style="background-color:rgb(116, 141, 114)">Pa</li><li style="background-color:rgb(86, 160, 144)">U</li><li style="background-color:rgb(152, 118, 78)">Np</li><li style="background-color:rgb(138, 127, 92)">Pu</li><li style="background-color:rgb(115, 142, 115)">Am</li><li style="background-color:rgb(192, 93, 38)">Cm</li><li style="background-color:rgb(221, 74, 9)">Bk</li><li style="background-color:rgb(227, 71, 3)">Cf</li><li style="background-color:rgb(108, 146, 122)">Es</li><li style="background-color:rgb(212, 81, 19)">Fm</li><li style="background-color:rgb(182, 99, 48)">Md</li><li style="background-color:rgb(117, 140, 113)">No</li><li style="background-color:rgb(178, 102, 52)">Lr</li><li style="background-color:rgb(152, 118, 78)">Rf</li><li style="background-color:rgb(169, 108, 61)">Db</li><li style="background-color:rgb(192, 93, 38)">Sg</li><li style="background-color:rgb(183, 98, 47)">Bh</li><li style="background-color:rgb(185, 98, 45)">Hs</li><li style="background-color:rgb(192, 93, 38)">Mt</li><li style="background-color:rgb(148, 121, 82)">Ds</li><li style="background-color:rgb(139, 127, 91)">Rg</li><li style="background-color:rgb(178, 102, 52)">Cn</li><li style="background-color:rgb(165, 110, 65)">Nh</li><li style="background-color:rgb(129, 133, 101)">Fl</li><li style="background-color:rgb(177, 102, 53)">Mc</li><li style="background-color:rgb(149, 120, 81)">Lv</li><li style="background-color:rgb(142, 125, 88)">Ts</li><li style="background-color:rgb(121, 138, 109)">Og</li></ol>

Oh yeah.
The puzzle.
That was the whole point wasn't it.
I guess you will have to wait for that one.

<script src="chemspell.js"></script>
<link rel="stylesheet" href="chemspell.css"></link>

[^1]: Turns out I couldn't bring myself to be completely lazy and added memoization to this implementation. Still not elegant or efficient, but avoids stack overflows.
