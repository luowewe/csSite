(() => {

  // Kludge to get the function assuming it was defined with const or let and
  // thus not on the window object.
  const get = (name) => {
    try {
      return Function(`return ${name}`)();
    } catch {
      return undefined;
    }
  };

  // Basically deep equals. Will break on cyclic structures.
  const equals = (o1, o2) => {
    if (o1 === null || o2 === null) {
      return o1 === o2;
    }

    const t1 = typeof o1;
    const t2 = typeof o2;
    if (t1 === t2) {
      if (t1 === 'object') {
        const same = (k) => equals(o1[k], o2[k]);
        return Object.keys(o1).every(same) && Object.keys(o2).every(same);
      } else {
        return o1 === o2;
      }
    } else {
      return false;
    }
  };

  const isFunction = (v) => typeof v === 'function';

  // Copy the args so test code can't mess with them. I'm assuming the only
  // non-cloneable kind of arg we're likely to have to deal with are functions.
  // But we might as well preserve object graphs since structured clone can do
  // it. We'll also assume that functions only occur directly as args, not
  // nested within other objects.
  const copyArgs = (args) => {

    // Find the function arguments and where they are.
    const functs = Object.fromEntries(args.map((v, i) => [i, v]).filter(x => isFunction(x[1])));

    // Null them out.
    const noFuncts = args.map((a, i) => i in functs ? null : a)

    // Preserve all cycles, even between arguments. (That probably can't happen
    // the way we define arguments now but maybe later.)
    const cloned = structuredClone(noFuncts);

    // Put back the function args
    Object.entries(functs).forEach(([i, f]) => cloned[i] = f);

    return cloned;
  }

  const runTestCase = (fn, test) => {
    const { args, expected } = test;
    const { got, exception } = runFn(fn, args);
    const passed = exception === null && equals(got, expected);
    return { args, expected, got, exception, passed };
  };

  const runFn = (fn, args) => {
    try {
      const got = fn(...copyArgs(args));
      return { got, exception: null };
    } catch (exception) {
      return { got: null, exception };
    }
  };

  const fnResults = (fn, cases) => {
    if (fn) {
      return cases.map((test) => runTestCase(fn, test));
    } else {
      return null; // i.e. function doesn't exist.
    }
  };


  // The function the javascript evaluator uses to get the results of running
  // the user code, such as the results of the test cases in this instance.
  javascriptEvaluator.getResults = () => {

    // testcases comes from testcases.js
    const { referenceImpls, allCases } = testcases;

    const actualCases = Object.fromEntries(Object.entries(allCases).map(([name, cases]) => {
      return [name, cases.map(args => ({ args: args, expected: referenceImpls[name](...args) })) ];
    }));

    return Object.fromEntries(
      Object.entries(actualCases).map(([name, cases]) => {
        return [name, fnResults(get(name), cases)]
      }));
  };

})();
