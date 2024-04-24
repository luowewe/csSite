import replize from './repl';
import { textIfOk } from './fetch-helpers';
import { $ } from './dom';
import testing from './testing';

const DEFAULT_IFRAME_CONFIG = {
  hidden: true,
  src: 'about:blank',
};

/*
 * The placeholder for where we will add the first evaluation iframe. If the
 * document contains an iframe element we use it. Otherwise, just stick an empty
 * div at the end of the body which will be immediately replaced.
 */
const placeholder = () => {
  let ph = document.querySelector('iframe');
  if (!ph) {
    ph = document.createElement('div');
    document.querySelector('body').appendChild(ph);
  }
  return ph;
};

class JavascriptEvaluator {
  constructor(config, message, username, metadata) {
    this.config = { ... config };
    this.config.iframe = config.iframe ?? DEFAULT_IFRAME_CONFIG;
    // FIXME: none of the config.json files in the original ItP contain a
    // 'script' property so it's not clear this does anything. It looks like
    // it's used to set attributes on the <script> tag but I'm not sure when I
    // needed to do that.
    this.scriptConfig = config.script ?? {};
    this.repl = replize(config.repl);
    this.repl.evaluate = (code, source) => this.evaluate(code, source);
    this.message = message;
    this.username = username;
    this.iframe = null;
    this.error = null;
    this.fromRepl = false;
    this.getResults = undefined;
    this.metadata = metadata;

    // Now reset things.
    this.resetIframe();
  }

  /*
   * Evaluate code in the current iframe. The code can use the objects and
   * functions attached to the the iframe in resetIframe to communicate back.
   * This method does not reset the iframe because it is also used by the repl
   * to evaluate expressions in the context of the code loaded from the editor.
   */
  evaluate(code, source) {
    this.fromRepl = source === 'repl';
    const d = this.iframe.contentDocument;
    const s = d.createElement('script');
    Object.entries(this.scriptConfig).forEach(([k, v]) => {
      s.setAttribute(k, v);
    });
    s.append(d.createTextNode(`"use strict";\n//# sourceURL=${source}\n${code}\n`));
    s.addEventListener('load', (e) => console.log(`Script ${source} loaded.`));;
    d.documentElement.append(s);
    console.log(`Evaluate of ${source} done.`);
  }

  loadFile(file) {

    console.log(`Loading script ${file}`);

    return new Promise((resolve, reject) => {
      const d = this.iframe.contentDocument;
      const s = d.createElement('script');
      s.src = file;
      s.onload = (e) => {
        console.log(`Script ${file} loaded.`);
        resolve()
      };
      s.onerror = (e) => {
        console.log(`Error loading ${file}.`);
        reject(e)
      };
      d.documentElement.append(s);
    });
  };

  /*
   * Returns a promise of the result of executing the code in the editor. It is
   * up to the code that calls execute to know what to do with the result.
   */
  async execute(code, source) {
    return new Promise((resolve, reject) => {
      this.resetIframe(() => {

        let p;

        // Load any other javascript files and evaluate them in the iframe.
        // FIXME: should probably do something if loading any of these produces
        // an error.
        if (this.config.extraFiles) {
          console.log('Loading extra files.');
          const loadedFiles = this.config.extraFiles.map(f => {
            return this.loadFile(new URL(f, window.location.href).pathname);
          });
          console.log(loadedFiles);
          p = Promise.all(loadedFiles);
        } else {
          p = Promise.resolve();
        }

        p.then(() => {
          this.evaluate(`${code}\nminibuffer.message('Loaded.', 1000);`, source);

          // If there was an error this.error will be set by the onerror function
          // we install on the iframe's window. It is reset to null in resetIframe
          // so if it's null here, that means there was no error.
          if (this.error === null) {

            // In order to get results from within the context of the iframe, one
            // of the files just loaded (Or I guess the user code) can install a
            // function into the outer window (via window.parent) named getResults
            // that takes the page config and does whatever it does to return "the
            // value" of the execution. If no such function has been installed the
            // value will be undefined which is fine.
            //
            // In the case of the unit tests, the run-tests.js script installs a
            // getResults that runs a bunch of test cases and returns a blob of
            // data about the results.
            try {
              resolve(this.getResults?.(this.config));
            } catch (e) {
              console.log('Exception getting results');
              console.log(e);
            }
          } else {
            reject(this.error);
          }
        });
      });
    });
  }

  /*
   * Create a new iframe to use for evaluating code, evaluating a passed-in
   * function after it is fully loaded.
   */
  resetIframe(after) {
    const f = document.createElement('iframe');

    // Depending on whether the iframe is purely local (i.e. about:blank) or
    // actually loaded over the network, the load event may fire as soon as we
    // add it to the document or at some later point. But we don't want to run
    // the after callback until all the setup in this function is complete.
    // Which is exactly what queueMicrotask is for, it seems. So here we are.
    f.onload = () => {
      queueMicrotask(() => this.repl.restart());
      if (after) queueMicrotask(after);
    };

    Object.entries(this.config.iframe).forEach(([k, v]) => {
      f.setAttribute(k, v);
    });

    (this.iframe ?? placeholder()).replaceWith(f);

    // Setup we can only do after adding the iframe to the document because
    // contentWindow doesn't exist until then. Add objects and functions to the
    // iframe's window object so code evaluated in the iframe can access them.
    f.contentWindow.repl = this.repl;
    f.contentWindow.console = this.repl.console;
    f.contentWindow.minibuffer = { message: this.message };
    f.contentWindow.onerror = (...args) => this.showError(...args);

    // These next three are just for the advent-of-code playground for the
    // moment, I think. (It helps out running tests against the test data by
    // fetching it from github and thus needs to know these things.) But it
    // seems like it might be generally handy.
    f.contentWindow.GITHUB_USER = this.username;
    f.contentWindow.GITHUB_ORG = this.metadata.githubOrganization;
    f.contentWindow.BRANCH = window.location.pathname;

    f.contentWindow.javascriptEvaluator = this;

    this.iframe = f;
    this.error = null;
  }

  /*
   * Show errors from evaluating code.
   */
  showError(msg, source, line, column, error) {
    // FIXME: (6/2023) as far as I can tell from the bug report this is fixed.
    // Should take this out and check. Unfortunately I don't recall exactly what
    // the symptom was.

    // This seems to be a Chrome bug. Doesn't always happen but probably safe to
    // filter this message.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1328008
    // https://stackoverflow.com/questions/72396527/evalerror-possible-side-effect-in-debug-evaluate-in-google-chrome
    if (error === 'EvalError: Possible side-effect in debug-evaluate') {
      return;
    }

    const e = errorMessage(error, line, column, source);

    if (this.fromRepl) {
      this.repl.error(e);
    } else {
      this.message(e);
      this.error = e;
    }
  }
}

const errorMessage = (error, line, column, source) =>
  source === 'repl' ? error : `${error} (line ${line - 2}, column ${column}) of ${source}`;

const evaluator = (config, message, username, metadata) => new JavascriptEvaluator(config, message, username, metadata);

export default evaluator;
