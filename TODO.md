# General

- Java image generator?

  - Java API for generating Javascript canvas code

  - Clean up wiring between frame and template.

  - Probably resize the canvas, at least initially, in the frame code.

- Make Jobe unit tests clear test case display if the code doesn't compile. Or
  maybe just switch between test case display and compilation errors as
  appropriate.

- Sort out where prism.css and prism.js should actually be used.

- Factor out common bits of assessment instructions into template.

- Simplify configuration of jobe java unit test pages.

- Make generic Java template with just one hole for the display (e.g. unit
  tests, canvas, etc.)

- For each evaluator define the interface that it uses to communicate back
  results of the evaluation (such as errors of various kinds, etc.) so the
  evaluator is not so tied to specific HTML element in the page.

- Support multiple source files in a project/assignment.

- Clean up existing playgrounds that aren't really providing value. Consider the
  item down below about using Netlify redirects to allow users to create their
  own playgrounds.

- Use dom.js where applicable.

- Figure out if the canvas frames actually even need a stylesheet. I think maybe
  not.

# Accessibility

Make the arrow buttons on assessments actually buttons.

# Git interactions

- Give a way to explicitly save with a comment so the branches aren't 100%
  "Updating". Or maybe better yet, use some heuristics to label the change. For
  instance if the code is empty the commit message can be, "Emptying out
  <file>". And maybe could grep for new or removed functions and write a comment
  like "Adding foo and bar functions."

- Add link to branch (or to create PR) from assignment pages. (Could maybe be
  extra fancy and mark the assignment as turned in if the branch has been merged
  to main.)

- Move "Saving" indicator into web page.

- Someday, should probably figure out if this thing should really be a GitHub
  App for finer grained permissions plus maybe the ability to do stuff in the
  org that the user doesn't have permission to do.

# UI

- Work on responsive design, esp. for games.

# Misc

- Show stack traces (see error.stack also
  https://github.com/stacktracejs/stacktrace.js)

# Games

- Deal with array out of bounds rather than returning undefined. (???)

- Show all the values that would have worked.

- Better commentary when expected answer is array and the given answer
  is an array but the element at the index is not the right type.

- Maybe add a version of holes game where the answers are just types.

- Show what wrong answers would have evaluated to (or that they
  wouldn't because of a type mismattch.)

- Add expressions in answers (e.g. 3 + 2 could be the answer to 6 >
  ??? ==> true).

- Actually use leveling, adjust it upwards when enough questions are
  answered correctly.

- Add variables somehow. Possibly just a table of variable values and
  then some answers are variable names.

- Maybe display log like a REPL: show the expression with the answer
  filled in, then what it evaluates to or "Type error" with some
  explanation. And maybe then the correct expression and what it
  evaluates to.

# Maybe not.

- Can we use web workers for evaluation? They can only load from files, it
  seems, which might be a problem. (Maybe just pass the code in as a string via
  postMessage and `eval` or `Function()` it in the worker.)

- Investigate using data URLs to import editor code as module into REPL. (Idea
  being: repl code is evaluated as a module but includes a line that does a
  dynamic import of a data URL containing the current code from the editor. That
  would mean that only exported things would be available in the REPL but that
  might actually be good?)

- Use netlify \_rewrite rule
  (https://docs.netlify.com/routing/redirects/rewrites-proxies/) to have a
  single page that handles all branches

# Done

- Upgrade to Eleventy 2.0

- Clean up files.

- Strip unneeded js.

- Java code evaluation via Jobe.

- Basic compile and run and get output for Java (and Python as it turns out)

- Factor out banner.liquid (now login-flow.liquid) into includes that can be used to customize it.

- Strip unneeded css.

- Rationalize layouts

- Rationalize css

- Perhaps move jobe URL to toplevel metadata?

- Show SHA subtly somewhere in web page.

- Make the clipboard icon in the banner move a bit when you press it.

- Github login flow with repo creation, etc.

- Monaco editor pane that saves to Github.

- Convert templates to nunjucks

- Add a key command to run code. (Well, made it a button so you can tab to it in the normal way.)

- Inject run-tests.js into the iframe if testing is on rather than requiring a
  frame to specify it.

- Unit test framework for got vs expected values.

- Write Java test runner.

- Implement file upload in jobe evaluator.

- Figure out a way for test pages to include the test cases with their
  descriptions in the HTML rather than in config.json.

- Refactor testcases.njk to support jobe-testcases.njk and a new
  js-testcases.njk

- Bring back rest of unit test assignments.

- Organize pages in collections

- Bring back Javascript Canvas

- Figure out why editor doesn't shrink back down when instructions are hidden
  and then reopened.

- Get rid of override:tags and move playground items into playgrounds directory.

- Rebuild calendar functionality.
