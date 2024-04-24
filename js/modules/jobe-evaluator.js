import { isOk, jsonIfOk, textIfOk } from './fetch-helpers';
import { $ } from './dom';
import testing from './testing';
import CryptoJS from 'crypto-js';
import { base64encode } from 'byte-base64';

// FIXME: This is tying us to Java. Need to generalize this. See also the FIXME
// where we build the canvas runargs.
const className = /public\s+(?:final\s+)?class\s+(\w+)/;

// For tests:

// - Put the user code as a file.

// - Send as the source a simple Main class that instantiates a TestRunner and
//   invokes it with the name of the user class and the reference class.

const sha1 = (text) => CryptoJS.enc.Hex.stringify(CryptoJS.SHA1(text));

const dump = (x) => console.log(JSON.stringify(x, null, 2));

const jobeOutcomes = {

  11: ("Compilation error. The cmpinfo field should offer further explanation"),

  12: ("Runtime error. The job compiled but threw an exception at run time " +
       "that isn't covered by any of the more-specific errors below."),

  13: ("Time limit exceeded. The job was killed before it ran to completion as " +
       "a result of the server-specified time limit (or a possible time limit " +
       "specified via the parameters field of the job request) being reached."),

  15: ("OK. The run ran to completion without any exceptions."),

  17: ("Memory limit exceeded. The job was killed before it ran to completion " +
       "as a result of the server-specified maximum memory limit (or a " +
       "possible memory limit specified via the parameters field of the job " +
       "request) being reached."),

  19: ("Illegal system call. The task attempted a system call not allowed by "+
       "this particular server."),

  20: ("Internal error. Something went wrong in the server. Please report this " +
       "to an administrator."),

  21: ("Server overload. No free Jobe user accounts. Probably something has " +
       "gone wrong."),
};

class JobeEvaluator {
  constructor(config, message, username, siteMetadata) {
    const { stdin, stdout, stderr } = config;
    this.stdin = $(`#${stdin}`);
    this.stdout = $(`#${stdout}`);
    this.stderr = $(`#${stderr}`);
    this.config = config;
    this.message = message;
    this.username = username;
    this.jobeUrl = this.config.jobe.host || siteMetadata.jobeUrl;
  }

  async execute(code, source) {

    this.stdout?.replaceChildren();
    this.stderr?.replaceChildren();

    const stdin = this.stdin?.value || await fileinput();

    const extraFiles = await Promise.all(this.config.extraFiles?.map(f => this.#putFile(f)) ?? []);

    return new Promise((resolve, reject) => {
      const start = performance.now();
      this.message('Submitting job ...');
      try {
        this.#evaluate(code, source, stdin, extraFiles).then(response => {

          const { stdout, stderr, outcome, cmpinfo } = response;

          if (outcome === 15 || outcome === 12) {
            const time = performance.now() - start;
            if (outcome === 15) {
              this.message(`Job complete. (${Math.round(time)} millis.)`);
            } else {
              this.message(`Runtime error (${Math.round(time)} millis.)`);
            }

            if (this.config.jobe.output === "json") {
              resolve(JSON.parse(stdout));
            } else if (this.config.jobe.output === "text") {
              this.stderr?.replaceChildren($('<pre>', stderr));
              resolve(stdout);
            } else {
              // FIXME: get this out of here. But for the moment this is
              // actually more in parallel with Javacript evaluator in that in
              // the normal case it just returns undefined as the result and
              // updates the UI itself.
              this.stdout?.replaceChildren($('<pre>', stdout));
              this.stderr?.replaceChildren($('<pre>', stderr));
              resolve();
            }
          } else if (outcome === 11) {
            this.message("Compile error");
            // FIXME: the error reporting to stderr should probably be handled
            // by index.js where it calls execute.
            this.stderr.replaceChildren($('<pre>', cmpinfo));
            reject(Error(cmpinfo));

          } else {
            this.message(jobeOutcomes[outcome]);
            reject(Error(jobeOutcomes[outcome] + ":\n" + stderr));
          }
        });
      } catch (e) {
        this.message('Problem submitting job.');
        this.stderr.replaceChildren($('<pre>', JSON.stringify(e)));
        reject(e);
      }
    });
  }

  /*
   * Evaluate code by sending it to the Jobe server. The model is simpler than
   * the Javascript evaluator because all we can do is compile and run the
   * program and get back it's stdout and stderr. And we can send some data to
   * be fed to the program's standard input.
   */
  async #evaluate(code, source, input, extraFiles) {
    const spec = this.#runSpec(code, source, input, extraFiles)
    return this.#submitJob(spec);
  }

  #runSpec(code, source, input, files=[]) {

    // FIXME: not sure this should just be jammed in here. THere's probably a
    // more principled way for the evaluator to determine the runargs (and maybe
    // other parts of the runspec) based on a smaller amount of info in the
    // config.json.
    if (this.config.canvas) {
      const b = $('iframe').getBoundingClientRect();
      this.config.jobe.parameters.runargs = [
        code.match(className)[1],
        b.width,
        b.height
      ];
    } else if (this.config.graphic) {
      const b = $('div.graphic img').getBoundingClientRect();
      this.config.jobe.parameters.runargs = [
        code.match(className)[1],
        Math.floor(b.width),
        Math.floor(b.height)
      ];
    }
    return {
      run_spec: {
        language_id: this.config.jobe.language || this.config.language,
        sourcecode: code,
        file_list: files,
        sourcefilename: javaFileName(code),
        input: input ?? '',
        parameters: this.config.jobe.parameters,
        debug: false,
      }
    }
  }

  async #submitJob(runSpec) {
    const url = `${this.jobeUrl}/jobe/index.php/restapi/runs/`;
    console.log(`Submitting job to ${this.jobeUrl}`);
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify(runSpec);
    return fetch(url, { method: 'POST', headers, body }).then(jsonIfOk);
  }

  async #putFile(filename) {
    // FIXME: could use check_file to avoid sending the file again.
    const text = await fetch(filename).then(textIfOk);
    const hash = sha1(text);
    const url = `${this.jobeUrl}/jobe/index.php/restapi/files/${hash}`;
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({file_contents: base64encode(text)})
    console.log(`Putting ${filename} to ${this.jobeUrl}`);
    return fetch(url, { method: 'PUT', headers, body }).then(isOk).then(() => {
      return [hash, filename];
    });
  }

}

const javaFileName = (code) => {
  return `${code.match(className)[1]}.java`;
}

const fileinput = async () => {
  if ($('#inputfile')) {
    let s = '';
    const files = $('#inputfile').files;
    for (let i = 0; i < files.length; i++) {
      s += await files.item(i).text();
    }
    return s;
  } else {
    return '';
  }
}


const evaluator = (config, message, username, metadata) => new JobeEvaluator(config, message, username, metadata);

export default evaluator;
