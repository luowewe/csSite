const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

const factorial = (n) => n < 2 ? 1 : n * factorial(n - 1);

const valueReplacer = (values, self) => {
  return () => {
    console.log('replacing value');
    self.onanimationend =  () => {
      self.innerText = values[self.innerText];
    };
    self.classList.add('highlight');
  };
};

const expressionReplacer = (value, self) => {
  return () => {
    console.log('replacing value');
    self.onanimationend =  () => {
      self.innerText = value;
    };
    self.classList.add('highlight');
  };
};

const returner = (r, call, callee, value) => {
  return (e) => {
    console.log('returning');

    r.onanimationend = () => {
      callee.style.display = 'none';
      call.onanimationend = () => {
        const span = document.createElement('span');
        span.innerText = value;
        call.replaceWith(span);
      };
      call.classList.add('highlight');
    };
    r.classList.add('highlight');
  };
};

const caller = (n, c) => {
  return (e) => {
    console.log('calling');
    c.onanimationend = () => {
      addFactorial(n, c);
      c.classList.remove('highlight');
    };
    c.classList.add('highlight');
  }
};

const addFactorial = (n, call) => {
  const prev = call.closest('div')
  const lang = window.location.hash ? window.location.hash.slice(1) : 'javascript';

  const template = document.querySelector(`#${lang}`).content.cloneNode(true);

  const code = template.firstElementChild;
  const booleanTrue = template.querySelector('.true').innerText;
  const booleanFalse = template.querySelector('.false').innerText;

  const r = prev.getBoundingClientRect();

  code.style.position = 'absolute';
  code.style.top = `${r.top + 20}px`;
  code.style.left = `${r.left + 20}px`;
  code.querySelectorAll('.n').forEach(e => e.innerText = n);

  const frame = [];

  const returns = code.querySelectorAll('.return');
  const expressions = code.querySelectorAll(".expression");
  const condition = code.querySelector(".condition");

  frame.push(valueReplacer({n: n, 'n - 1': n - 1}, expressions[0]))
  frame.push(expressionReplacer(n === 0 ? booleanTrue : booleanFalse, condition));

  if (n !== 0) {
    [...expressions].slice(1).forEach(e => frame.push(valueReplacer({n: n, 'n - 1': n - 1}, e)));
    code.querySelectorAll('.call').forEach(e => frame.push(caller(n - 1, e)));
    frame.push(expressionReplacer(factorial(n), code.querySelector('.returnvalue')));
    frame.push(returner(returns[1], call, code, factorial(n)));
  } else {
    frame.push(returner(returns[0], call, code, factorial(n)));
  }

  frames.push(frame);

  document.body.append(code);
  return code;
}

$('#start .call').onclick = caller(4, $('#start .call'));

const frames = [[caller(4, $('#start .call'))]];

const next = () => {
  console.log(frames);
  const frame = frames[frames.length - 1];
  const todo = frame.shift();
  if (frame.length === 0) {
    frames.pop();
  }
  todo();
};

document.body.onkeydown = next;
