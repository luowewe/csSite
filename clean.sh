#!/bin/bash

#
# Keep
#

# .eleventy.js
# .eleventyignore
# .eslintrc.json
# .gitignore
# .ignore
# .prettierignore
# .prettierrc
# .tidyconfig
# LICENSE
# Makefile
# NOTES.md
# README.minimal
# TODO.md
# _classes/
# _includes/
# _layouts/
# _markup/
# favicon.ico
# favicons/
# mathjax/
# package-lock.json

#
# Keep but some changes needed
#

#: README.md - keep but edit
#: css/ - keep but remove specific files.
#: github-test.html - makes as much sense here as anywhere
#: img/ - keep but remove specific files.
#: index.html - keep but edit
#: js/ - keep but remove specific files.
#: multiple-choice/ - keep for now as an example
#: package.json - keep but check depenencies
#: publish.sh - keep for now. May be made more general
#: test-repo-create.html - makes as much sense here as anywhere

#
# Remove
#

git rm -r _markup/book
git rm -r _markup/slides/*.txt
git rm -r advent-of-code/
git rm -r assessments/
git rm -r assignments/
git rm -r book/
git rm -r calendar/
git rm -r demo/
git rm -r end-of-year/
git rm -r expressions/
git rm -r factorial/
git rm -r fib/
git rm -r fork/
git rm -r gallery/
git rm -r games/
git rm -r grading/
git rm -r lisp/
git rm -r misc/
git rm -r monty-hall/
git rm -r policy/
git rm -r projects/
git rm -r prs/
git rm -r recipes/
git rm -r refactoring/
git rm -r reveal/
git rm -r review/
git rm -r scripts/
git rm -r slides/
git rm -r standards/
git rm -r starter-kits/
git rm -r web-stuff/
git rm 2022-23-notes.txt
git rm build-starter-kits.sh
git rm tron.txt
