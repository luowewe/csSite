// The whole point of this code is to use Function() to evaluate code, so:
/* eslint no-new-func: "off" */

import Login from './modules/login';
import makeTable from './modules/table';
import { $, $$, icon } from './modules/dom';
import { inferTypes } from './modules/type-inference';
import { jsonIfOk } from './modules/fetch-helpers';
import { shuffle } from './modules/shuffle';

const randomStrings = ['foo', 'bar', 'baz', 'banana', 'grue', 'orange', 'FOO', 'SpOnGe BoB'];

const randomGenerators = {
  positive: () => 1 + Math.floor(Math.random() * 100),
  number: () => -100 + Math.random() * 2 * 100,
  notZero: () => (1 + Math.floor(Math.random() * 100)) * (Math.random() < 0.5 ? 1 : -1),
  boolean: () => Math.random() < 0.5,
  string: () => randomStrings[Math.floor(Math.random() * randomStrings.length)],
};

const allValues = {
  boolean: [true, false],
  string: randomStrings,
};

/*
 * Generate (at most) n test cases. For some combinations of types we can
 * exhaustively generate all possible sets of arguments otherwise we generate a
 * set of n random cases.
 */
const testCases = (types, n) => {
  if (types.length === 0) {
    return [];
  } else if (types.every((t) => t in allValues) && cardinality(types) <= n) {
    return exhaustive(types);
  } else {
    return Array(n)
      .fill()
      .map(() => generateRandom(types));
  }
};

const cardinality = (types) => types.reduce((acc, t) => acc * allValues[t].length, 1);

const exhaustive = (types) => {
  if (types.length === 0) {
    return [];
  } else if (types.length === 1) {
    return allValues[types[0]].map((v) => [v]);
  } else {
    const rest = exhaustive(types.slice(1));
    return allValues[types[0]].flatMap((v) => rest.map((r) => [v, ...r]));
  }
};

const generateRandom = (types) => types.map((t) => randomGenerators[t]());

const parseVariables = (s) => {
  if (typeof s === 'string') {
    return s === '' ? {} : Object.fromEntries(s.split(',').map((s) => s.split(':')));
  } else {
    return null;
  }
};

// End type inference
////////////////////////////////////////////////////////////////////////////////

class Expressions {
  constructor(divs, completed, marks) {
    const divArray = Array.from(divs);
    if ($('#shuffleExpressions')) {
      shuffle(divArray);
    }
    this.expressions = divArray.map((div, i) => new Expression(this, div, i));
    this.completed = completed;
    this.answers = [];
    this.current = this.expressions[0];
    this.expressions.forEach((e) => {
      e.hide();
      marks.appendChild(e.marker);
    });
    this.storage = null;
  }

  switchTo(exp) {
    this.current.hide();
    this.current = exp;
    this.current.show();
  }

  next() {
    const currentIndex = this.current.index;
    for (let i = 0; i < this.expressions.length; i++) {
      const j = (i + currentIndex) % this.expressions.length;
      const expr = this.expressions[j];
      if (!this.answeredCorrectly(expr)) {
        return expr;
      }
    }
    return undefined;
  }

  answeredCorrectly(expr) {
    return this.answers.some(({ name, correct }) => correct && name === expr.name);
  }

  checkAnswer(answer) {
    const expr = this.current;

    try {
      const correct = expr.check(answer);

      this.addAnswer(expr, answer, correct);

      if (!correct) {
        $('#results').replaceChildren(
          $(
            '<p>',
            `Uh, oh! ${expr.numWrong()} of ${
              expr.results.length
            } test cases failed. Here’s a sample.`,
          ),
          expr.problems(8),
        );
        this.completed.addRowAtTop([expr.name, answer, '❌']);
      } else {
        $('#expression-input').value = '';
        this.completed.addRowAtTop([expr.name, answer, '✅']);
        this.switchToNext(false);
      }
    } catch (e) {
      console.log(e);
      $('#results').replaceChildren(document.createTextNode(`Uh, oh! ${e.name}`));
    }
  }

  addAnswer(expr, answer, correct) {
    const { name, canonical } = expr;
    const timestamp = Date.now();
    this.answers.push({ name, canonical, answer, correct, timestamp });
    this.saveAnswers();
  }

  saveAnswers() {
    if (this.storage.repo) {
      this.storage.saveToGithubOnBranch(
        'expressions.json',
        JSON.stringify(this.answers, null, 2),
        'main',
      );
    }
  }

  // Wipe out all current answers and save a new empty answers file. Should
  // probabyl only allow this after they finish the problem set.
  resetAnswers() {
    this.answers = [];
    this.current = this.expressions[0];
    this.saveAnswers();
    this.switchFromDone();
    this.showAllAnswers();
    this.switchToNext(false);
  }

  async loadAnswers() {
    try {
      const text = await this.storage.loadFromGithubOnBranch('expressions.json', 'main');
      this.answers = JSON.parse(text);
      this.showAllAnswers();
      this.switchToNext(true);
    } catch {
      console.log('No answers to load.');
    }
  }

  showAllAnswers() {
    this.completed.clearAllRows();
    this.answers.forEach(({ name, answer, correct }) => {
      this.completed.addRowAtTop([name, answer, correct ? '✅' : '❌']);
    });
    this.expressions.forEach((expr) => {
      if (this.answeredCorrectly(expr)) {
        expr.fillMarker();
      } else {
        expr.emptyMarker();
      }
    });
  }

  switchToNext(justLoaded) {
    const n = this.next();
    if (n) {
      this.switchTo(n);
      $('#results').replaceChildren();
    } else {
      this.switchToDone();
    }
  }

  switchToDone() {
    //const correct = this.answers.reduce((acc, a) => acc + (a.correct ? 1 : 0), 0);
    //const accuracy = Math.round((100 * correct) / this.answers.length);
    const accuracy = averageAccuracy(this.answers);

    this.current.hide();
    $('#results').style.display = 'none';
    document.querySelector('.marks').style.display = 'none';
    document.querySelector('.questions').style.display = 'none';
    $('#accuracy').innerHTML = `Accuracy: ${accuracy}%`;
    document.querySelector('.done').hidden = false;
  }

  switchFromDone() {
    $('#results').style.display = 'block';
    document.querySelector('.marks').style.display = 'flex';
    document.querySelector('.questions').style.display = 'block';
    document.querySelector('.done').hidden = true;
  }
}

const averageAccuracy = (answers) => {
  const qs = {};
  answers.forEach((a) => {
    if (!(a.name in qs)) {
      qs[a.name] = { correct: 0, incorrect: 0 };
    }
    qs[a.name][a.correct ? 'correct' : 'incorrect']++;
  });
  const perQuestion = Object.values(qs).map((q) => q.correct / (q.correct + q.incorrect));
  return (
    100 * (perQuestion === 0 ? 0 : perQuestion.reduce((acc, v) => acc + v, 0) / perQuestion.length)
  );
};

class Expression {
  constructor(expressions, div, index) {
    this.expressions = expressions;
    this.div = div;
    this.index = index;

    this.name = div.querySelector('h1').innerText;
    this.canonical = div.dataset.expression;

    const vars = parseVariables(div.dataset.variables) ?? inferTypes(this.canonical);

    if (vars === null) {
      throw new Error(
        `No explicit variable declaration and can't infer types from ${this.canonical}`,
      );
    }

    this.variables = Object.keys(vars);
    this.types = Object.values(vars);
    this.expectedFn =
      this.variables.length === 0
        ? new Function(`return (${this.canonical});`)
        : new Function(this.variables, `return (${this.canonical});`);

    this.marker = icon('circle');
    this.marker.onclick = () => expressions.switchTo(this);
  }

  hide() {
    this.div.hidden = true;
  }

  show() {
    this.div.hidden = false;
  }

  check(answer) {
    const cases = testCases(this.types, 1024);

    if (cases.length === 0) {
      this.results = [this.checker(answer)([])];
    } else {
      this.results = cases.map(this.checker(answer));
    }
    const correct = this.results.every((r) => r.passed);

    if (correct) {
      this.fillMarker();
    }
    return correct;
  }

  fillMarker() {
    this.marker.childNodes[0].setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      `/img/bootstrap-icons.svg#circle-fill`,
    );
  }

  emptyMarker() {
    this.marker.childNodes[0].setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      `/img/bootstrap-icons.svg#circle`,
    );
  }

  checker(answer) {
    const fn = Function(this.variables, `return (${answer});`);

    return (args) => {
      const expected = this.expectedFn(...args);
      try {
        const got = fn(...args);
        const passed = equal(expected, got);
        return { args, expected, got, passed };
      } catch (e) {
        return { args, expected, e, passed: false };
      }
    };
  }

  problems(limit) {
    const t = makeTable();
    t.table.className = 'problems';
    this.variables.forEach((v) => t.addColumn(v, 'variable'));
    t.addColumn('Expected', 'expected');
    t.addColumn('Got', 'got');
    this.results
      .filter((r) => !r.passed)
      .slice(0, limit)
      .forEach((r) => {
        t.addRow([...r.args, JSON.stringify(r.expected), JSON.stringify(r.got) ?? r.e]);
      });
    return t.table;
  }

  numWrong() {
    return this.results.filter((r) => !r.passed).length;
  }
}

const equal = (a, b) => {
  if (a === b) {
    // Actually the same, we're good.
    return true;
  } else if (typeof a !== typeof b) {
    // We're strict about types.
    return false;
  } else if (isFloat(a) || isFloat(b)) {
    // Check non integers by relative tolerance.
    const relError = Math.abs(a - b) / Math.abs((a + b) / 2);
    return relError <= 0.00001; // This may be way too conservative
  } else {
    return false;
  }
};

const isFloat = (n) => typeof n === 'number' && !Number.isInteger(n);

const completedTable = () => {
  const t = makeTable();
  t.addColumn('Problem', 'problem');
  t.addColumn('Answer', 'answer');
  t.addColumn('Ok?', 'ok');
  return t;
};

const setup = async () => {

  const metadata = await fetch('/metadata.json').then(jsonIfOk);
  const login = new Login(metadata);

  const completed = completedTable();
  $('#completed').replaceChildren(completed.table);

  const expressions = new Expressions(
    $$('.expression'),
    completed,
    document.querySelector('.marks'),
  );
  expressions.current.show();

  expressions.storage = await login.makeStorage();

  const onAttachToGithub = async () => {
    console.log("Just attached to github. Should merge any answers in memory with what's in git.");
    expressions.loadAnswers();
  };

  login.setupToolbar(onAttachToGithub);

  if (expressions.storage.repo !== null) {
    console.log('Have storage. Could grab answers.');
    expressions.loadAnswers();
  } else {
    console.log('No storage.');
  }

  $('#expression-input').onkeydown = (e) => {
    if (e.key === 'Enter') {
      expressions.checkAnswer(e.target.value);
    }
  };
  if ($('#shuffleExpressions')) {
    $('#reset').remove();
  } else {
    $('#reset').onclick = () => expressions.resetAnswers();
  }

  document.querySelectorAll('.questions code').forEach(
    (e) =>
      (e.onclick = () => {
        $('#expression-input').value += e.innerText;
        $('#expression-input').focus();
      }),
  );
};

setup();
