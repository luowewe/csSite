const fs = require('fs');
const esbuild = require('esbuild');
const { NODE_ENV = 'production' } = process.env;

const monaco_workers = [
  'vs/editor/editor.worker.js',
  'vs/language/css/css.worker.js',
  'vs/language/html/html.worker.js',
  'vs/language/json/json.worker.js',
  'vs/language/typescript/ts.worker.js',
];

/*
 * Code adapted from https://github.com/jhipster/prettier-java/issues/552.
 * There's one file in the bowels of prettier-plugin-java that refers to
 * `process`. This plugin finds that file and adds a line to keep it from being
 * undefined. This plugin needs to be added to the esbuild.build invocation of
 * whatever source wants to import prettier-plugin-java.
 */
const fixProcessPlugin = {
  name: 'fix_process',
  setup(build) {
    build.onLoad({ filter: /\/node_modules\/java-parser\/src\/utils\.js$/ }, (args) => {
      let code = fs.readFileSync(args.path, 'utf8');
      if (code.includes('process')) {
        const contents = [code, ';globalThis.process = globalThis.process;'].join('\n');
        return { contents, loader: 'js' };
      }
    });
  }
};

const isProduction = NODE_ENV === 'production';

module.exports = class {
  data() {
    return {
      permalink: false,
      eleventyExcludeFromCollections: true,
    };
  }

  async render(data) {
    const baseBuildConfig = {
      bundle: true,
      loader: { '.ttf': 'file' },
      outdir: `${data.eleventyConfig.dir.output}/js`,
      sourcemap: true,
      target: 'es6',
    };

    // Build our own JS code.
    const jsFiles = await fs.promises
      .readdir('js')
      .then((files) => files.filter((f) => f.endsWith('.js')));

    await esbuild.build({
      ...baseBuildConfig,
      entryPoints: jsFiles.map((f) => `js/${f}`),
      // This plugin needs to go here because prettier-java-plugin is referenced
      // by our own Javascript so we need it patched in our bundle.
      plugins: [ fixProcessPlugin ],
      minify: false,
    });

    // Build the dynamically loaded Monaco worker code.
    await esbuild.build({
      ...baseBuildConfig,
      entryPoints: monaco_workers.map((f) => `node_modules/monaco-editor/esm/${f}`),
      minify: true,
      outbase: './node_modules/monaco-editor/esm/',
    });
  }
};
