// Adapted from https://www.aleksandrhovhannisyan.com/blog/eleventy-build-info/

module.exports = () => {

  const now = new Date();
  const timeZone = 'America/Los_Angeles';

  const raw = now.toISOString();
  const formatted = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone,
  }).format(now);

  const human = `${formatted} Pacific`;

  const childProcess = require('node:child_process');

  // https://stackoverflow.com/a/34518749/5323344
  const hash = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
  const clean1 = childProcess.spawnSync('git',  ['diff', '--exit-code']).status == 0;
  const clean2 = childProcess.spawnSync('git',  ['diff', '--cached', '--exit-code']).status == 0;

  const dirty = !(clean1 && clean2);

  return {
    time: { raw, human },
    hash,
    dirty,
  }

};
