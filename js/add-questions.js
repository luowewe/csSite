import { Prims } from './prism.js';
import { questionsSetup } from './questions-module.js';

const pat = /^\/\/ Q: (.+)$/;

const parseQuestions = (text) => {
  const qs = [];
  let q;
  text.split('\n').forEach(line => {
    const m = line.match(pat)
    if (m) {
      q = { text: '', style: m[1] };
      qs.push(q);
    } else {
      q.text += `${line}\n`;
    }
  });
  return qs;
};

const fillQuestions = (questions)  => {

  const container = document.getElementById('questions');

  questions.forEach(q => {
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.append(`Rewrite this function in ${q.style} style.`);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.dataset.trim = '';
    code.dataset.noescape = '';
    code.classList.add('language-javascript');
    code.appendChild(document.createTextNode(q.text.trimEnd()));
    pre.append(code);

    div.append(p);
    div.append(pre);

    container.append(div);

    Prism.highlightElement(code);
  });

  questionsSetup();
}

//<code data-trim='' data-noescape='' class='language-javascript'> </code></pre>

const code = fetch(`${window.location.pathname}questions.js`)
      .then(r => r.text())
      .then(t => fillQuestions(parseQuestions(t)));
