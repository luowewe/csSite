import { $ } from './dom';

// The Java program returns on its stdout a complete Javascript program that
// can assume it's running in a window that has a single canvas object.
const inject = (code) => {
  // Do we need to reset the iframe? Maybe?
  const s = $('<script>', `"use strict";\n//# sourceURL=Java Output\n${code}\n`);
  $('iframe').contentDocument.documentElement.append(s)
  console.log(`Added Java generated code to frame.`);
};


export default inject;
