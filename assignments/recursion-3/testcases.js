const isNumber = (x) => typeof x === 'number';

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

  const arrayOf = (n, fn) =>
    Array(n)
      .fill()
      .map((_, i) => fn(i, n));

  const argify = (xs) => xs.map((x) => [x]);

  return {
    referenceImpls: {
      sumSquares: (n) => {
        if (n === 0) {
          return 0;
        } else {
          return n ** 2 + sumSquares(n - 1);
        }
      },

      product: (ns) => {
        if (ns.length === 0) {
          return 1;
        } else {
          return ns[0] * product(ns.slice(1));
        }
      },

      lucas: (n) => (n < 2 ? [2, 1][n] : lucas(n - 2) + lucas(n - 1)),

      isAscending: (ns) => {
        if (ns.length < 2) {
          return true;
        } else {
          return ns[0] <= ns[1] && isAscending(ns.slice(1));
        }
      },

      isDescending: (ns) => {
        if (ns.length < 2) {
          return true;
        } else {
          return ns[0] >= ns[1] && isDescending(ns.slice(1));
        }
      },

      sumNested: (x) => {
        if (x.length === 0) {
          return 0;
        } else {
          if (isNumber(x)) {
            return x;
          } else {
            return sumNested(x[0]) + sumNested(x.slice(1));
          }
        }
      },

      searchNested: (x, t) => {
        if (isNumber(x)) {
          return x === t;
        } else if (x.length === 0) {
          return false;
        } else {
          return searchNested(x[0], t) || searchNested(x.slice(1), t);
        }
      },

      evaluate: (expr) => {
        if (isNumber(expr)) {
          return expr;
        } else {
          const left = evaluate(expr.left);
          const right = evaluate(expr.right);
          if (expr.op === '+') {
            return left + right;
          } else if (expr.op === '-') {
            return left - right;
          } else if (expr.op === '*') {
            return left * right;
          } else if (expr.op === '/') {
            return left / right;
          }
        }
      },

      search: (ns, n, start, end) => {
        const mid = start + Math.floor(end / 2);
        if (ns[mid] === n) {
          return mid;
        } else if (ns[mid] < n) {
          return search(ns, n, mid, end);
        } else {
          return search(ns, n, start, mid);
        }
      },
      isPrime: (n) => {
        if (n < 2) return false;

        const helper = (d) => {
          if (d === 1) {
            return true;
          } else if (n % d === 0) {
            return false;
          } else {
            return helper(d - 1);
          }
        };

        return helper(Math.floor(Math.sqrt(n)));
      },
    },

    allCases: {
      sumSquares: argify([0, 1, 10, 5 + Math.floor(Math.random() * 15)]),
      product: argify(
        Array(10)
          .fill()
          .map((_, i) =>
            Array(i)
              .fill()
              .map(() => Math.floor(Math.random() * 100)),
          ),
      ),
      lucas: argify([...range(0, 5), ...randomIntegers(5, 6, 15)]),
      isAscending: argify([
        ...arrayOf(3, () => randomIntegers(5, 0, 10)),
        ...arrayOf(5, () => randomIntegers(5, 0, 10).sort((a, b) => b - a)),
        ...arrayOf(5, () => randomIntegers(5, 0, 10).sort((a, b) => a - b)),
      ]),
      isDescending: argify([
        ...arrayOf(3, () => randomIntegers(5, 0, 10)),
        ...arrayOf(5, () => randomIntegers(5, 0, 10).sort((a, b) => b - a)),
        ...arrayOf(5, () => randomIntegers(5, 0, 10).sort((a, b) => a - b)),
      ]),
      sumNested: argify([
        [],
        [1, 2, 3],
        [1, [2, [3, 4]]],
        [
          [1, 2],
          [3, 4],
        ],
      ]),
      searchNested: [
        [[], 10],
        [[1, 2, 3], 2],
        [[1, 2, 3], 4],
        [[1, [2, [3, 4]]], 1],
        [[1, [2, [3, 4]]], 3],
        [[1, [2, [3, 4]]], 5],
        [
          [
            [1, 2],
            [3, 4],
          ],
          1,
        ],
        [
          [
            [1, 2],
            [3, 4],
          ],
          4,
        ],
        [
          [
            [1, 2],
            [3, 4],
          ],
          0,
        ],
      ],
      evaluate: argify([
        10,
        { op: '+', left: 10, right: 20 },
        { op: '-', left: 10, right: 20 },
        { op: '*', left: 10, right: 20 },
        { op: '/', left: 10, right: 20 },
        { op: '+', left: 10, right: { op: '*', left: 2, right: 3 } },
        { op: '+', left: { op: '*', left: 3, right: 4 }, right: { op: '/', left: 45, right: 8 } },
      ]),
    },
  };
})();
