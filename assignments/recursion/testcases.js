// Define this outside here so code under test can use it to
const isLeaf = (tree) => typeof tree !== 'object';

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

  const randomNumbers = randomIntegers(5, 0, 10);
  const randomChoice = randomNumbers[Math.floor(Math.random() * randomNumbers.length)];
  const coins = [1, 5, 10, 25, 50];

  const argify = (xs) => xs.map((x) => [x]);

  return {
    referenceImpls: {
      factorial: (n) => (n < 2 ? 1 : n * factorial(n - 1)),

      fibonacci: (n) => (n < 2 ? n : fibonacci(n - 2) + fibonacci(n - 1)),

      triangular: (n) => (n === 0 ? n : n + triangular(n - 1)),

      gcd: (a, b) => (b === 0 ? a : gcd(b, a % b)),

      sum: (ns) => (ns.length === 0 ? 0 : ns[0] + sum(ns.slice(1))),

      search: (xs, item) => {
        if (xs.length === 0) {
          return false;
        } else if (xs[0] === item) {
          return true;
        } else {
          return search(xs.slice(1), item);
        }
      },

      reverseString: (s) => {
        if (s === '') {
          return '';
        } else {
          return reverseString(s.substring(1)) + s[0];
        }
      },

      treeMap: (tree, fn) => {
        if (isLeaf(tree)) {
          return fn(tree);
        } else {
          const left = treeMap(tree.left, fn);
          const right = treeMap(tree.right, fn);
          return { left, right };
        }
      },

      change: (amt, coins) => {
        if (amt === 0) {
          return 1;
        } else if (amt < 0 || coins.length === 0) {
          return 0;
        } else {
          return change(amt - coins[0], coins) + change(amt, coins.slice(1));
        }
      },
    },

    allCases: {
      factorial: argify(range(0, 21)),
      fibonacci: argify(range(0, 11)),
      triangular: argify([...range(0, 11), ...randomIntegers(5, 11, 100)]),
      gcd: [
        [50, 100],
        [100, 50],
        [17, 19],
        [60, 102],
        [102, 60],
        [37, 0],
        [0, 37],
        [1071, 462],
      ],
      sum: argify([[], range(0, 11), range(5, 10), randomIntegers(5, 0, 100)]),
      search: [
        [[], 10],
        [[10], 10],
        [[11], 10],
        [randomNumbers, 20],
        [randomNumbers, randomChoice],
      ],
      reverseString: argify(['', 'abcdef', 'Javascript', 'a man a plan a canal panama']),
      treeMap: [
        [10, (x) => x * 2],
        [{ left: 10, right: 20 }, (x) => x * 2],
        [{ left: { left: 2, right: 4 }, right: 20 }, (x) => x * 2],
      ],
      change: [
        [100, coins],
        [0, coins],
        [1, coins],
        [10 + Math.floor(Math.random() * 40), coins],
        [100, []],
        [200, coins],
        [-13, coins],
        // [0, []], This could arguably be either 0 or 1.
      ],
    },
  };
})();
