const testcases = (() => {
  const student = (name, grade) => ({ name, grade });

  const students = [
    student('Betty', 12),
    student('Fred', 9),
    student('Barney', 10),
    student('Wilma', 9),
  ];

  // Predicates
  const isEven = (n) => n % 2 === 0;
  const isOdd = (n) => !isEven(n);
  const isBig = (n) => n > 100;

  // Mappers
  const pair = (x) => [x, x];
  const name = (o) => o.name;
  const grade = (o) => o.grade;

  return {
    referenceImpls: {
      // Filter
      evens: (ns) => ns.filter(isEven),
      odds: (ns) => ns.filter(isOdd),
      big: (ns) => ns.filter(isBig),

      // Map
      names: (xs) => xs.map(name),
      grades: (xs) => xs.map(grade),
      pairs: (xs) => xs.map(pair),

      // Reduce
      averageGrade: (xs) => xs.reduce((tot, x) => tot + x.grade, 0) / xs.length,

      // Flatmap
      flatpairs: (xs) => xs.flatMap(pair),

      // Every
      allEven: (ns) => ns.every(isEven),

      // Some
      someEven: (ns) => ns.some(isEven),

      //
      lengthOfNames: (ss) => ss.filter((s) => s[0].toUpperCase() === s[0]).map((s) => s.length),
    },

    allCases: {
      evens: [[[1, 2, 3, 4, 5, 6]], [[-1, -2, -3, -4, -5, -6, 0]], [[]]],
      odds: [[[1, 2, 3, 4, 5, 6]], [[-1, -2, -3, -4, -5, -6, 0]], [[]]],
      big: [
        [
          Array(10)
            .fill()
            .map((e, i) => i * 20),
        ],
        [
          Array(10)
            .fill()
            .map((e, i) => i),
        ],
        [[]],
      ],

      // Map
      names: [[students], [[]]],
      grades: [[students], [[]]],
      pairs: [[[1, 2, 3, 4]], [[10]], [[]]],

      // Reduce
      averageGrade: [[students], [students.slice(0, 1)]],

      // Flatmap
      flatpairs: [[[1, 2, 3, 4]], [[10]], [[]]],

      // Every
      allEven: [
        [[1, 2, 3, 4, 5, 6]],
        [[-1, -2, -3, -4, -5, -6, 0]],
        [
          Array(5)
            .fill()
            .map((_, i) => i * 2),
        ],
        [
          Array(5)
            .fill()
            .map((_, i) => i * 2 + 1),
        ],
        [[]],
      ],

      // Some
      someEven: [
        [[1, 2, 3, 4, 5, 6]],
        [[-1, -2, -3, -4, -5, -6, 0]],
        [
          Array(5)
            .fill()
            .map((_, i) => i * 2),
        ],
        [
          Array(5)
            .fill()
            .map((_, i) => i * 2 + 1),
        ],
        [[]],
      ],

      lengthOfNames: [[['Fred', 'Barney', 'car', 'Wilma', 'rock', 'Betty', 'dinosaur']], [[]]],
    },
  };
})();
