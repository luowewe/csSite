const url = (file) => {
  const base = `https://raw.githubusercontent.com/${GITHUB_ORG}`;
  return `${base}/${GITHUB_USER}/${BRANCH}/${BRANCH}/${file}`;
};

const textIfOk = (r) => {
  if (r.ok) {
    return r.text();
  }
  throw r;
};

const run = async (file, fn, expected) => {
  fetch(url(file), { cache: 'no-cache' })
    .then(textIfOk)
    .then((s) => {
      try {
        const result = fn(s);
        if (expected !== undefined) {
          console.log(
            `${file} - ${fn.name}: ${
              result === expected ? 'ok' : `uh oh: got: ${result}; expected: ${expected}`
            }`,
          );
        } else {
          console.log(result);
        }
      } catch (e) {
        console.error(`${e.name}: ${e.message}`);
      }
    });
};
