(() => {
  const elements = [
    [1, "H", "Hydrogen"],
    [2, "He", "Helium"],
    [3, "Li", "Lithium"],
    [4, "Be", "Beryllium"],
    [5, "B", "Boron"],
    [6, "C", "Carbon"],
    [7, "N", "Nitrogen"],
    [8, "O", "Oxygen"],
    [9, "F", "Fluorine"],
    [10, "Ne", "Neon"],
    [11, "Na", "Sodium"],
    [12, "Mg", "Magnesium"],
    [13, "Al", "Aluminum"],
    [14, "Si", "Silicon"],
    [15, "P", "Phosphorus"],
    [16, "S", "Sulfur"],
    [17, "Cl", "Chlorine"],
    [18, "Ar", "Argon"],
    [19, "K", "Potassium"],
    [20, "Ca", "Calcium"],
    [21, "Sc", "Scandium"],
    [22, "Ti", "Titanium"],
    [23, "V", "Vanadium"],
    [24, "Cr", "Chromium"],
    [25, "Mn", "Manganese"],
    [26, "Fe", "Iron"],
    [27, "Co", "Cobalt"],
    [28, "Ni", "Nickel"],
    [29, "Cu", "Copper"],
    [30, "Zn", "Zinc"],
    [31, "Ga", "Gallium"],
    [32, "Ge", "Germanium"],
    [33, "As", "Arsenic"],
    [34, "Se", "Selenium"],
    [35, "Br", "Bromine"],
    [36, "Kr", "Krypton"],
    [37, "Rb", "Rubidium"],
    [38, "Sr", "Strontium"],
    [39, "Y", "Yttrium"],
    [40, "Zr", "Zirconium"],
    [41, "Nb", "Niobium"],
    [42, "Mo", "Molybdenum"],
    [43, "Tc", "Technetium"],
    [44, "Ru", "Ruthenium"],
    [45, "Rh", "Rhodium"],
    [46, "Pd", "Palladium"],
    [47, "Ag", "Silver"],
    [48, "Cd", "Cadmium"],
    [49, "In", "Indium"],
    [50, "Sn", "Tin"],
    [51, "Sb", "Antimony"],
    [52, "Te", "Tellurium"],
    [53, "I", "Iodine"],
    [54, "Xe", "Xenon"],
    [55, "Cs", "Cesium"],
    [56, "Ba", "Barium"],
    [57, "La", "Lanthanum"],
    [58, "Ce", "Cerium"],
    [59, "Pr", "Praseodymium"],
    [60, "Nd", "Neodymium"],
    [61, "Pm", "Promethium"],
    [62, "Sm", "Samarium"],
    [63, "Eu", "Europium"],
    [64, "Gd", "Gadolinium"],
    [65, "Tb", "Terbium"],
    [66, "Dy", "Dysprosium"],
    [67, "Ho", "Holmium"],
    [68, "Er", "Erbium"],
    [69, "Tm", "Thulium"],
    [70, "Yb", "Ytterbium"],
    [71, "Lu", "Lutetium"],
    [72, "Hf", "Hafnium"],
    [73, "Ta", "Tantalum"],
    [74, "W", "Tungsten"],
    [75, "Re", "Rhenium"],
    [76, "Os", "Osmium"],
    [77, "Ir", "Iridium"],
    [78, "Pt", "Platinum"],
    [79, "Au", "Gold"],
    [80, "Hg", "Mercury"],
    [81, "Tl", "Thallium"],
    [82, "Pb", "Lead"],
    [83, "Bi", "Bismuth"],
    [84, "Po", "Polonium"],
    [85, "At", "Astatine"],
    [86, "Rn", "Radon"],
    [87, "Fr", "Francium"],
    [88, "Ra", "Radium"],
    [89, "Ac", "Actinium"],
    [90, "Th", "Thorium"],
    [91, "Pa", "Protactinium"],
    [92, "U", "Uranium"],
    [93, "Np", "Neptunium"],
    [94, "Pu", "Plutonium"],
    [95, "Am", "Americium"],
    [96, "Cm", "Curium"],
    [97, "Bk", "Berkelium"],
    [98, "Cf", "Californium"],
    [99, "Es", "Einsteinium"],
    [100, "Fm", "Fermium"],
    [101, "Md", "Mendelevium"],
    [102, "No", "Nobelium"],
    [103, "Lr", "Lawrencium"],
    [104, "Rf", "Rutherfordium"],
    [105, "Db", "Dubnium"],
    [106, "Sg", "Seaborgium"],
    [107, "Bh", "Bohrium"],
    [108, "Hs", "Hassium"],
    [109, "Mt", "Meitnerium"],
    [110, "Ds", "Darmstadtium"],
    [111, "Rg", "Roentgenium"],
    [112, "Cn", "Copernicium"],
    [113, "Nh", "Nihonium"],
    [114, "Fl", "Flerovium"],
    [115, "Mc", "Moscovium"],
    [116, "Lv", "Livermorium"],
    [117, "Ts", "Tennessine"],
    [118, "Og", "Oganesson"],
  ].map(([num, symbol, name]) => { return {number: num, symbol: symbol, name: name} })

  function product(iterables, repeat) {
    var argv = Array.prototype.slice.call(arguments), argc = argv.length;
    if (argc === 2 && !isNaN(argv[argc - 1])) {
      var copies = [];
      for (var i = 0; i < argv[argc - 1]; i++) {
        copies.push(argv[0].slice()) // Clone
      }
      argv = copies
    }
    return argv.reduce(function tl(accumulator, value) {
      var tmp = []
      accumulator.forEach(function(a0) {
        value.forEach(function(a1) {
          tmp.push(a0.concat(a1))
        })
      })
      return tmp
    }, [[]])
  }

  const generateGroupings = (() => {
    let memo = {}
    return (wordlength) => {
      if(wordlength in memo) {
        return memo[wordlength]
      }
      let result = []
      for(var i=1; i <= wordlength; i++){
        result = result.concat(product([1,2], i).filter(g => g.reduce((acc, el) => acc + el, 0) == wordlength))
      }
      memo[wordlength] = result
      return result
    }
  })()

  const spell = (bank) => {
    return (word) => {
      let g = generateGroupings(word.length)
      let spellings = []

      for(var i=0; i < g.length; i++) {
        let start = 0
        let spelling = []
        for(var j=0; j < g[i].length; j++) {
          if(bank.includes(word.substr(start, g[i][j]))) {
            spelling.push(word.substr(start, g[i][j]))
            start += g[i][j]
          } else {
            break
          }

          if(j == g[i].length-1) {
            spellings.push(spelling)
          }
        }
      }

      return spellings
    }
  }

  const elSpell = spell(elements.map(el => el.symbol.toLowerCase()));

  ((parent) => {
    let inp = document.createElement('input')
    inp.placeholder = 'sour grapes'
    inp.maxLength = 15

    let spellingsEl = document.createElement('div')
    spellingsEl.classList.add('spellings')

    inp.addEventListener('input', (e) => {
      while(spellingsEl.firstChild) {
        spellingsEl.removeChild(spellingsEl.firstChild)
      }
      let target = inp.value.toLowerCase().replace(' ', '')
      if(target == "") {
        inp.classList.remove('unspellable')
        return
      }

      spellings = elSpell(target)
      if (spellings.length === 0) {
        inp.classList.add('unspellable')
      } else {
        inp.classList.remove('unspellable')
        spellings.forEach(spelling => {
          let spellingEl = document.createElement('div')
          spelling.forEach(sym => {
            let el = elements.find(e => e.symbol.toLowerCase() == sym)
            let elEl = document.createElement('div')
            elEl.classList.add('element')
            let symEl = document.createElement('span')
            symEl.classList.add('symbol')
            symEl.innerText = el.symbol
            elEl.appendChild(symEl)
            let numEl = document.createElement('span')
            numEl.classList.add('number')
            numEl.innerText = el.number
            elEl.appendChild(numEl)
            let nameEl = document.createElement('span')
            nameEl.classList.add('name')
            nameEl.innerText = el.name
            elEl.appendChild(nameEl)
            spellingEl.appendChild(elEl)
          })
          spellingsEl.appendChild(spellingEl)
        })
      }
    })

    parent.appendChild(inp)
    parent.appendChild(spellingsEl)
  })(document.getElementById('chemspell'));
})();
