const numberWords = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
];

const tenWords = [
  null,
  null,
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

const numberToEnglish = (n) => {
  if (n < numberWords.length) {
    return numberWords[n];
  } else if (n < 100) {
    return `${tenWords[Math.floor(n / 10)]} ${numberWords[n % 10]}`;
  } else {
    return '' + n;
  }
};

const branchName = (pathname) => {
  if (pathname.startsWith('/')) pathname = pathname.substring(1);
  if (pathname.endsWith('/')) pathname = pathname.substring(0, pathname.length - 1);
  return pathname;
};

const questionsSetup = () => {

  const instructions = document.getElementById('instructions');
  const hidden = document.getElementById('hidden');
  const questions = document.getElementById('questions').children;

  document.querySelectorAll('.of').forEach((e) => (e.innerHTML = `${questions.length}`));
  document.getElementById('num-questions').innerHTML = numberToEnglish(questions.length);
  document.getElementById('branch-name').innerText = branchName(window.location.pathname);

  let current = window.location.hash ? Number.parseInt(window.location.hash.substring(1), 10) - 1 : 0;

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

  const gotoQ = (e) => {
    const num = Number.parseInt(new URL(e.target.href).hash.substring(1), 10) - 1;
    show(num);
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

  document.querySelectorAll('code').forEach((e) => {
    e.onclick = () => navigator.clipboard.writeText(e.innerText);
  });

  document.getElementById('previous-q').onclick = previous;
  document.getElementById('next-q').onclick = next;
  if (document.getElementById('close')) {
    document.getElementById('close').onclick = hideInstructions;
    document.getElementById('open').onclick = showInstructions;
  }
  document.querySelectorAll('span.menu a').forEach((e) => (e.onclick = gotoQ));

  show(current);
};

export { questionsSetup };
