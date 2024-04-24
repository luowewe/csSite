import Login from './modules/login';
import inject from './modules/inject';
import javascriptEvaluator from './modules/javascript-evaluator';
import jobeEvaluator from './modules/jobe-evaluator';
import monaco from './modules/editor';
import testing from './modules/testing';
import { $ } from './modules/dom';
import { jsonIfOk } from './modules/fetch-helpers';


const evaluators = {
  java: jobeEvaluator,
  javascript: javascriptEvaluator,
  python: jobeEvaluator,
};

////////////////////////////////////////////////////////////////////////////////
// UI manipulations

const message = (text, fade) => {
  $('.minibuffer').innerText = text;
  if (fade) {
    setTimeout(() => {
      if ($('.minibuffer').innerText === text) {
        $('.minibuffer').innerText = '';
      }
    }, fade);
  }
};

// End UI manipulations
////////////////////////////////////////////////////////////////////////////////

const commitTime = (isodate) => {
  const d = new Date(isodate);
  const today = new Date().toDateString();
  const date = d.toDateString();

  const h = d.getHours();

  const hh = ((h + 11) % 12) + 1;
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  const ss = `${d.getSeconds()}`.padStart(2, '0');
  const amPm = h > 12 ? 'pm' : 'am';

  const time = `${hh}:${mm}:${ss} ${amPm}`;

  return date === today ? time : `${date} ${time}`;
};

const populateRevisions = (revs) => {
  const select = $('#file-revisions');
  revs.forEach((r, i) => {
    const opt = document.createElement('option');
    opt.value = r.sha;
    opt.innerText = commitTime(r.commit.author.date);
    select.append(opt);
  });
};

const addRevision = (commit) => {
  const select = $('#file-revisions');
  const opt = document.createElement('option');
  opt.value = commit.sha;
  opt.innerText = commitTime(commit.author.date);
  select.prepend(opt);
  opt.selected = true;
};

const setup = async () => {

  // Top level information about the site.
  const metadata = await fetch('/metadata.json').then(jsonIfOk);

  // Get the per-page configuration that tells us things like what code to load.
  const config = await fetch('config.json').then(jsonIfOk);
  const editor = monaco('editor', config.language);

  const login = new Login(metadata);
  const storage = await login.makeStorage();

  let resultDisplay;
  if (config.testing) {
    resultDisplay = testing($(config.testing.id), $(config.testing.casesId));
    resultDisplay.update({});
  } else if (config.canvas) {
    resultDisplay = { update(result) { inject(result); } };
  } else if (config.graphic) {
    console.log('Setting up graphic result display.');
    resultDisplay = {
      update(result) {
        $('div.graphic img').outerHTML = result;
      }
    };
  } else {
    resultDisplay = { update(result) {} };
  }

  const evaluator = evaluators[config.language](config, message, login.username, metadata);

  // FIXME: not sure we ever used a list of files for anything. I guess could
  // actually be useful in with the Jobe-based evaluator to add other files that
  // we create on the jobe server before submitting the code to be compiled.

  // Code has to be the first element of the files list.
  const [filename] = config.files;

  // Put code in editor. Don't evaluate it immediately in case we've saved
  // something that doesn't work (e.g. contains an infinite loop that crashes
  // the page.)
  const fillEditor = (code) => {
    editor.setValue(code);
  };

  const loadRevision = (sha) => {
    storage.loadFromGithubOnBranch(filename, sha).then(fillEditor);
  };

  // Evaluate code now in editor and also save it.
  const reevaluateCode = () => {
    const code = editor.getValue();
    // FIXME: In java we should rename the file if the name of the public class
    // changes. For the moment we can just fix the filename when we send it to
    // Jobe but really we should change how it's saved in git too. But then we
    // have to deal with different revisions needing to fetch a different file.
    // Gah.
    storage.save(filename, code).then((f) => {
      if (f.commit) {
        addRevision(f.commit);
        if (f.updated || f.created) {
          console.log('Saved.'); // FIXME: should show this in the web UI somewhere.
        }
      } else {
        console.log('No new commit.');
      }
    });

    // Get the value (if any) from executing the code and hand it to the
    // resultDisplay object to render. Obviously the resultDisplay and the
    // result need to match. So if the resultDisplay is a testing object then
    // the page had better be configured either to include some run-script.js
    // file (in the case of the Javascript evaluator) or to request the result
    // as json (in the case of the Jobe evaluator) so that the result is a blob
    // of test results.
    evaluator.execute(code, filename).then(result => resultDisplay.update(result));
  };

  // For when we log in to GitHub after the user has loaded the page and maybe
  // even edited the file. FIXME: this doesn't do anything with the machinery
  // (which probably isn't fully baked) for saving versions of files while
  // disconnected.
  const onAttachToGithub = async () => {
    const current = editor.getValue();
    const starter = await storage.loadFromWeb(filename);

    if (login.isMember && !login.pending) {
      const inRepo = await storage.ensureFileInBranch(filename);

      if (current === starter && inRepo !== starter) {
        // I.e. we loaded the page, got the starter, and then logged in
        // immediately. Switch to repo version.
        fillEditor(inRepo);
        storage.revisions(filename).then(populateRevisions);
      } else if (current !== starter && current !== inRepo) {
        // We loaded the page, messed about with the code, and then logged in.
        // Don't really need to do anything since we're just going to leave things
        // as they are. However might be nice to ask if they want to revert to
        // what's in the repo. Or show a diff. Or whatever. If they then evaluate
        // the code it will be saved, stomping the latet verson in git. Of course,
        // old versions are recoverable from git.
      }
    }
  };

  login.setupToolbar(onAttachToGithub);

  if (storage.repo !== null) {
    storage.ensureFileInBranch(filename).then((code) => {
      fillEditor(code);
      storage.revisions(filename).then(populateRevisions);
    });
  } else {
    storage.load(filename).then(fillEditor);
  }

  $('.editor-toolbar .run-code').onclick = reevaluateCode;

  $('.minibuffer').onclick = () => {
    $('.minibuffer').innerText = '';
  };

  $('#file-revisions').onchange = (e) => {
    loadRevision(e.target.value);
  };
};

setup();
