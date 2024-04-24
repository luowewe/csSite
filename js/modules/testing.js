import { $, text, withClass } from './dom';

/*
 * Turn a div we are given into a widget for displaying test results. We are not
 * responsible for actually running the tests because that happens off in the
 * hidden iframe. (Hmmm, possibly we could pass this object the evaluator and
 * let it register with the evaluator to be notified when code is loaded so it
 * can do it's thing. That's probably better. FIXME.)
 *
 * FIXME: Or maybe not if we want to support multiple languages.
 *
 */
const testing = (div, casesTemplate) => new Testing(div, casesTemplate);

const makePills = (names) => {
  const pills = withClass('pills', $('<div>'));
  names.forEach(name => {
    pills.append(pill(name));
  });
  return pills;
};

const pill = (name) => {
  const b = withClass('no_results', $('<button>', name));
  b.value = name;
  b.append(withClass('marker', $('<span>', '')));
  return b;
};

const pillStyle = (results) => {
  if (results === null) {
    return { style: 'no_results', marker: '' };
  } else if (results.every((x) => x.passed)) {
    return { style: 'all_passing', marker: '✅' };
  } else {
    return { style: 'some_failing', marker: '❌' };
  }
};

const resultsTable = () => {
  const table = withClass('results', $('<table>'));
  table.hidden = true;

  const colgroup = $('<colgroup>');
  colgroup.append(withClass('functionCall', $('<col>')));
  colgroup.append(withClass('got', $('<col>')));
  colgroup.append(withClass('expected', $('<col>')));
  colgroup.append(withClass('result', $('<col>')));
  table.append(colgroup);

  const thead = $('<thead>');
  const tr = $('<tr>');
  tr.append($('<th>', 'Invocation'));
  tr.append($('<th>', 'Got'));
  tr.append($('<th>', 'Expected'));
  tr.append($('<th>', 'Passed?'));
  thead.append(tr);
  table.append(thead);
  table.append($('<tbody>'));
  return table;
};

const noResults = () => {
  const div = withClass(
    'no-results',
    $('<div>', 'No test results. You need to define a function with the correct name and run your code.'),
  );
  div.hidden = true;
  return div;
};

const resultsBody = (name, results) => {
  const tbody = $('<tbody>');
  results.forEach((result) => addResultRow(tbody, name, result));
  return tbody;
};

const addResultRow = (tbody, name, result) => {
  const { args, got, exception, expected, passed } = result;
  const row = tbody.insertRow();
  row.className = passed ? 'pass' : 'fail';
  row.insertCell().append(`${name}(${stringifyArgs(args).join(', ')})`);
  row.insertCell().append(exception ? `${exception}` : $('<pre>', stringifyReturnValue(got)));
  row.insertCell().append($('<pre>', stringifyReturnValue(expected)));
  row.insertCell().append(text(statusEmoji(passed, exception)));
};

const stringify = (v) => {
  if (typeof v === 'function') {
    return v.toString();
  } else {
    return JSON.stringify(v);
  }
};

const stringifyArgs = (args) =>  args.map(stringify);

const stringifyReturnValue = (v) => {
  if (v === undefined) {
    return 'undefined';
  } else {
    const json = JSON.stringify(v, null, 2);
    if (json === 'null' && v !== null) {
      return v.toString();
    } else {
      return json;
    }
  }
};


const statusEmoji = (passed, exception) => {
  if (passed) {
    return '✅';
  } else if (exception) {
    return '💥';
  } else {
    return '❌';
  }
};

const functionDescription = (name, description) => {
  const desc = withClass('description', $('<div>'));
  const prefix = $('<b>', `${name}: `);

  const ps = description.cloneNode(true).children;
  ps[0].prepend(prefix);
  desc.replaceChildren(...ps);
  return desc;
};

class Testing {
  constructor(div, casesTemplate) {
    this.div = div;

    this.descriptions = Object.fromEntries([...casesTemplate.content.children].map(c => [c.dataset.name, c]))
    this.pills = makePills(Object.keys(this.descriptions));

    this.description = withClass('description', $('<div>'));
    this.table = resultsTable();
    this.noResults = noResults();
    this.summary = withClass('summary', $('<div>'));

    this.div.append(this.pills);
    this.div.append(this.description);
    this.div.append(this.table);
    this.div.append(this.noResults);
    this.div.append(this.summary);

    this.selected = Object.keys(this.descriptions)[0];
  }

  update(testResults) {
    this.pills.querySelectorAll('button').forEach((b) => {
      const results = testResults[b.value] ?? null;
      b.classList.remove('no_results', 'some_failing', 'all_passing');

      const { style, marker } = pillStyle(results);
      b.classList.add(style);

      // Changed when getting rid of whjqah. if it's broken now, that's probably why.
      b.querySelector('.marker').replaceChildren(text(marker))

      b.onclick = () => this.displayResults(b.value, results);
    });

    if (this.selected) {
      this.displayResults(this.selected, testResults[this.selected] ?? null);
    }
  }

  displayResults(name, results) {
    this.selected = name;
    navigator.clipboard.writeText(name);

    const newDesc = functionDescription(name, this.descriptions[name]);
    this.description.replaceWith(newDesc);
    this.description = newDesc;

    if (results !== null) {
      const old = this.table.querySelector('tbody');
      this.table.replaceChild(resultsBody(name, results), old);
      this.table.hidden = false;
      this.noResults.hidden = true;

      const passed = results.reduce((a, b) => a + (b.passed ? 1 : 0), 0);
      const all = passed === results.length ? 'All ' : '';
      const stop = passed === results.length ? '!' : '.';

      this.summary.replaceChildren(
        $('<p>', `${all}${passed} of ${results.length} test cases passed${stop}`),
      );
    } else {
      this.noResults.hidden = false;
      this.table.hidden = true;
      this.summary.hidden = true;
    }
  }
}

export default testing;
