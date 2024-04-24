const tagPattern = /^<(\w+)>$/;

const $ = (q, content) => {
  const tag = q.match(tagPattern)?.[1];
  if (tag) {
    const e = document.createElement(tag);
    if (content !== undefined) e.append(content);
    return e;
  } else {
    return document.querySelector(q);
  }
};

const $$ = (q) => document.querySelectorAll(q);

const doc = Object.fromEntries([...$$('[id]')].map(e => [e.id, e]));

const reset = () => {
  $$('.x').forEach((e) => e.remove());
  doc.calls.innerText = '0';
};

let running = false;

const cells = Array(21)
  .fill()
  .map((_, i) => {
    const s = $('<span>', `fib(${i})`);
    s.classList.add('fib');
    s.onclick = () => {
      if (!running) {
        running = true;
        reset();
        animateCall(i, (r) => {
          console.log(`Answer: ${r}`);
          running = false;
        });
      }
    };
    const d = $('<div>', s);
    d.classList.add('cell');
    return d;
  });

cells.forEach((c) => doc.table.prepend(c));

const animateCall = (n, cc) => {
  const cell = cells[n];
  const f = cell.querySelector('.fib');

  doc.calls.innerText = Number(doc.calls.innerText) + 1;

  const x = $('<span>', '○');
  x.classList.add('x');
  f.classList.add('highlight');
  cell.append(x);

  const doReturn = (result) => {
      x.innerText = '●';
      f.classList.remove('highlight');
      cc(result);
  };

  setTimeout(() => {
    if (n < 2) {
      doReturn(n);
    } else {
      animateCall(n - 2, (r1) => {
        animateCall(n - 1, (r2) => {
          doReturn(r1 + r2);
        });
      });
    }
  }, 2000 / 1.5 ** doc.speed.value);
};
