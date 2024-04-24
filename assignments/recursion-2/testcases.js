// Expose to code under test.
const isEven = (n) => n % 2 === 0;

const testcases = (() => {

  const range = (min, max) => {
    return Array(max - min)
      .fill()
      .map((_, i) => min + i);
  };

  const randomIntegers = (n, min, max) => {
    const range = max - min;
    return Array(n)
      .fill()
      .map(() => min + Math.floor(Math.random() * range));
  };

  const argify = (xs) => xs.map((x) => [x]);

  const table = range(0, 11).flatMap((a) => range(0, 11).map((b) => [a, b]));

  const xs = argify(['', 'abcdef', 'xyzzy', 'xxx', 'axbxcx']);

  return {
    referenceImpls: {
      add: (a, b) => a + b,

      multiply: (a, b) => a * b,

      double: (a, b) => a * 2 ** b,

      triple: (a, b) => a * 3 ** b,

      power: (a, b) => a ** b,

      countXs: (s) => {
        if (s === '') {
          return 0;
        } else {
          if (s[0] === 'x') {
            return 1 + countXs(s.substring(1));
          } else {
            return countXs(s.substring(1));
          }
        }
      },

      deleteXs: (s) => {
        if (s === '') {
          return s;
        } else {
          if (s[0] === 'x') {
            return deleteXs(s.substring(1));
          } else {
            return s[0] + deleteXs(s.substring(1));
          }
        }
      },
      maximum: (ns) => Math.max(...ns),

      every: (xs, p) => xs.every(p),

      some: (xs, p) => xs.some(p),
    },

    allCases: {
      add: table,
      multiply: table,
      double: table,
      triple: table,
      power: table,
      deleteXs: xs,
      countXs: xs,
      maximum: argify(range(0, 10).map((n) => randomIntegers(n, 0, 100))),
      every: [
        [randomIntegers(5, 0, 100), isEven],
        [[], isEven],
        [[1], isEven],
        [[2], isEven],
        [randomIntegers(5, 0, 100).map((n) => n * 2), isEven],
        [randomIntegers(5, 0, 100).map((n) => n * 2 + 1), isEven],
      ],
      some: [
        [randomIntegers(5, 0, 100), isEven],
        [[], isEven],
        [[1], isEven],
        [[2], isEven],
        [randomIntegers(5, 0, 100).map((n) => n * 2), isEven],
        [randomIntegers(5, 0, 100).map((n) => n * 2 + 1), isEven],
      ],
    },
  };
})();
