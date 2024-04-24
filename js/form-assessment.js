import Login from './modules/login';
import { jsonIfOk } from './modules/fetch-helpers';
import { basicSetup, } from "codemirror"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { java } from "@codemirror/lang-java"

const instructions = document.getElementById('instructions');
const hidden = document.getElementById('hidden');

let current = window.location.hash ? Number.parseInt(window.location.hash.substring(1), 10) - 1 : 0;

let questions;
let answers = [];
let key = null;
let storage = null;

const setup = async () => {
  document.getElementById('previous-q').onclick = previous;
  document.getElementById('next-q').onclick = next;
  document.getElementById('close').onclick = hideInstructions;
  document.getElementById('open').onclick = showInstructions;

  questions = document.getElementById('questions').children;
  document.getElementById('of').innerHTML = `${questions.length}`;
  makeChoices(questions);
  makeMultipleChoices(questions);
  makeFreeanswers(questions);
  makeLongFreeanswers(questions);
  makeCodeanswers(questions);

  const metadata = await fetch('/metadata.json').then(jsonIfOk);
  const login = new Login(metadata);

  storage = await login.makeStorage();

  const onAttachToGithub = async () => {
    console.log('Attached to github.');
    loadAnswers(questions);
    loadKey(storage);
  };

  login.setupToolbar(onAttachToGithub);

  if (storage.repo !== null) {
    loadAnswers(questions);
    loadKey(storage);
  } else {
    console.log('No storage.');
  }

  show(current);
};

const loadAnswers = async (questions) => {
  console.log('Loading answers');
  try {
    const text = await storage.loadFromGithubOnBranch('answers.json', 'main');
    answers = JSON.parse(text);
    fillAnswers(questions, answers);
  } catch (e) {
    console.log('No answers to load.');
    console.log(e);
  }
};

const fillAnswers = (questions, answers) => {
  answers.forEach((a, i) => {
    fillAnswer(questions[i], a);
  });
};

const fillAnswer = (question, answer) => {
  fillChoices(question, answer);
  fillMultipleChoices(question, answer);
  fillFreeanswer(question, answer);
  fillLongFreeanswer(question, answer);
  fillCodeanswer(question, answer);
};

const fillChoices = (question, answer) => {
  const choices = question.querySelector('.choices');
  if (choices) {
    [...choices.children].forEach((d) => {
      if (d.innerText === answer) {
        d.querySelector('input').checked = true;
      }
    });
  }
};

const fillMultipleChoices = (question, answer) => {
  const mchoices = question.querySelector('.mchoices');
  if (mchoices) {
    [...mchoices.children].forEach((d) => {
      if (answer.includes(d.innerText)) {
        d.querySelector('input').checked = true;
      }
    });
  }
};

const fillFreeanswer = (question, answer) => {
  const freeanswer = question.querySelector('.freeanswer');
  if (freeanswer) {
    const input = freeanswer.querySelector('input');
    const saveNotice = freeanswer.querySelector('.save-notice');
    saveNotice.innerText = 'Saved';
    input.value = answer;
  }
};

const fillLongFreeanswer = (question, answer) => {
  const e = question.querySelector('.longfreeanswer');
  if (e) {
    const input = e.querySelector('textarea');
    const saveNotice = e.querySelector('.save-notice');
    saveNotice.innerText = 'Saved';
    input.value = answer;
  }
};


const fillCodeanswer = (question, answer) => {
  const e = question.querySelector('.codeanswer');
  if (e) {
    e.editor.dispatch({
      changes: {from: 0, to: e.editor.state.doc.length, insert: answer}
    });
    e.querySelector('.save-notice').innerText = 'Saved';
  }
};


const makeChoices = (questions) => {
  [...questions].forEach((div, q) => {
    const choices = div.querySelector('.choices');
    if (choices) {
      [...choices.children].forEach((d) => {
        const answer = d.innerText;
        const radio = document.createElement('input');
        const label = document.createElement('label');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', `q${q}`);
        radio.onchange = () => saveAnswer(q, answer);
        const span = document.createElement('span');
        [...d.childNodes].forEach((n) => span.append(n));
        label.append(radio);
        label.append(span);
        d.replaceChildren(label);
      });
    }
  });
};

const makeMultipleChoices = (questions) => {
  [...questions].forEach((div, q) => {
    const mchoices = div.querySelector('.mchoices');
    const saveChecked = () => {
      const answers = [...mchoices.children]
            .filter(c => c.querySelector('input').checked)
            .map(c => c.innerText);
      saveAnswer(q, answers);
    };

    if (mchoices) {
      [...mchoices.children].forEach((d) => {
        const answer = d.innerText;
        const checkbox = document.createElement('input');
        const label = document.createElement('label');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('name', `q${q}`);
        checkbox.onchange = saveChecked;
        const span = document.createElement('span');
        [...d.childNodes].forEach((n) => span.append(n));
        label.append(checkbox);
        label.append(span);
        d.replaceChildren(label);
      });
    }
  });
};

const makeFreeanswers = (questions) => {
  [...questions].forEach((div, q) => {
    const answer = div.querySelector('.freeanswer');
    if (answer) {
      const input = document.createElement('input');
      const saveNotice = document.createElement('p');
      saveNotice.classList.add('save-notice');
      saveNotice.innerText = 'Unsaved';

      input.setAttribute('type', 'text');
      input.setAttribute('placeholder', answer.innerText.trim());
      input.onchange = (e) => {
        saveAnswer(q, e.target.value);
        saveNotice.innerText = 'Saved';
      };
      input.oninput = () => (saveNotice.innerText = 'Unsaved');

      answer.replaceChildren(input, saveNotice);
    }
  });
};

const makeLongFreeanswers = (questions) => {
  [...questions].forEach((div, q) => {
    const answer = div.querySelector('.longfreeanswer');
    if (answer) {
      const input = document.createElement('textarea');
      const saveNotice = document.createElement('p');
      saveNotice.classList.add('save-notice');
      saveNotice.innerText = 'Unsaved';

      input.setAttribute('placeholder', answer.innerText.trim());
      input.onchange = (e) => {
        saveAnswer(q, e.target.value);
        saveNotice.innerText = 'Saved';
      };
      input.oninput = () => (saveNotice.innerText = 'Unsaved');
      answer.replaceChildren(input, saveNotice);
    }
  });
};

const makeCodeanswers = (questions) => {
  [...questions].forEach((div, q) => {
    const answer = div.querySelector('.codeanswer');
    if (answer) {
      console.log('Found codeanswer ' + answer);
      const input = document.createElement('div');
      const saveNotice = document.createElement('p');
      saveNotice.classList.add('save-notice');
      saveNotice.innerText = 'Unsaved';

      const onchange = EditorView.updateListener.of(v => {
        if (v.docChanged) {
          saveNotice.innerText = 'Unsaved';
        }
      });

      const onblur = EditorView.focusChangeEffect.of((state, focusing) => {
        if (!focusing) {
          saveAnswer(q, state.doc.toString());
          saveNotice.innerText = 'Saved';
        }
      });

      const editor = new EditorView({
        doc: "public void foo(){}\n",
        extensions: [basicSetup, keymap.of([indentWithTab]), java(), onchange, onblur],
        parent: input,
      });

      answer.editor = editor;

      answer.replaceChildren(input, saveNotice);
    }
  });
};

const toggleAnswers = (key, show) => {
  if (show) {
    showAnswers(key);
  } else {
    hideAnswers();
  }
};

const showAnswers = (key) => {
  const questions = document.getElementById('questions').children;
  [...questions].forEach((q, i) => {
    const { answer, explanation } = key[i];
    let gloss = undefined;
    if (explanation) {
      gloss = document.createElement('p');
      gloss.classList.add('gloss');
      gloss.innerHTML = explanation;
    }
    showChoices(q, answer, gloss);
    showMultipleChoices(q, answer, gloss);
    showFreeanswer(q, answer, gloss);
  });
};

const showChoices = (q, answer, gloss) => {
  const choices = q.querySelector('.choices');
  if (choices) {
    [...choices.children].forEach((p) => {
      if (p) {
        if (p.innerText === answer) {
          p.classList.add('correct');
        }
      }
    });
    if (gloss) {
      choices.after(gloss);
    }
  }
};

const showMultipleChoices = (q, answer, gloss) => {
  const mchoices = q.querySelector('.mchoices');
  if (mchoices) {
    [...mchoices.children].forEach((p) => {
      if (p) {
        if (answer.includes(p.innerText)) {
          p.classList.add('correct');
        }
      }
    });
    if (gloss) {
      mchoices.after(gloss);
    }
  }
};

const showFreeanswer = (q, answer, gloss) => {
  const freeanswer = q.querySelector('.freeanswer');
  if (freeanswer) {
    const p = document.createElement('p');
    p.classList.add('canonical');
    p.append(`Canonical answer: ${answer[0]}`);
    freeanswer.querySelector('.save-notice').before(p);
    if (gloss) {
      p.after(gloss);
    }
  }
};

const hideAnswers = () => {
  document.querySelectorAll('.correct').forEach((e) => e.classList.remove('correct'));
  document.querySelectorAll('.canonical').forEach(e => e.remove());
  document.querySelectorAll('.gloss').forEach(e => e.remove());
};

const loadKey = async (storage) => {
  try {
    key = JSON.parse(await storage.loadFromWeb('key.json'));
    const show = document.getElementById('show-answers');
    show.hidden = false;
    show.querySelector('input').onchange = (e) => toggleAnswers(key, e.target.checked);
  } catch (e) {
    console.log('key.json not found');
    const show = document.getElementById('show-answers');
    show.style.display = 'none';
  }
};

const saveAnswer = (q, answer) => {
  answers[q] = answer;
  saveAnswers(answers);
};

const saveAnswers = (answers) => {
  if (storage.repo) {
    storage.saveToGithubOnBranch('answers.json', JSON.stringify(answers, null, 2), 'main');
  }
};

const show = (n) => {
  document.getElementById('q').innerHTML = `${n + 1}`;
  window.location.hash = `#${n + 1}`;
  questions[current].style.display = 'none';
  current = n;
  questions[current].style.display = 'block';
};

const previous = (e) => {
  show((current - 1 + questions.length) % questions.length);
  e.stopPropagation();
  e.preventDefault();
};

const next = (e) => {
  show((current + 1) % questions.length);
  e.stopPropagation();
  e.preventDefault();
};

const hideInstructions = () => {
  hidden.style.display = 'inline';
  instructions.style.display = 'none';
};

const showInstructions = () => {
  hidden.style.display = 'none';
  instructions.style.display = 'inline';
};

setup();
