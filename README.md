# Programming class tools

A set of tools for building websites for programming classes. The idea is to
provide an extremely simple and controllable development environment that
integrates with Github and uses the Monaco (a.k.a. VSCode) in-browser editor.

For Javascript it should maximally leverage the browser's built in Javascript
environment rather than shipping code to a server. For other languages it uses
the Jobe server to compile and execute programs and get the results.

The GitHub integration allows you to automatically set up a repo belonging to
each student (once they have a GitHub account) and save their work into it
behind the scenes so you have a record of their code in git and can use all the
tools you're used to look at their code.

When I used this in my Intro to Programming class I checked in code for each
assignment and assessment into its own branch but also in a distinct part of the
directory tree to avoid conflicts. Students then turned in their work by going
to Github and creating a PR so I could leave comments on their code via the
Github PR machinery.

## Branch organization

Since I teach multiple courses each year and also need to update things each
year this repository is organized a bit more like an old-school released
software setup. The `main` branch serves as the jumping off point each year from
which I can create branches for each course.

The `main` branch will tend to contain everything that might be useful for one
course or another so I can make a branch and then whittle it down to what I
need for that particular course.

At the beginning of each year I will make a new branch for each course with just
the name of the course, e.g. `itp`, `csa`, `advanced`.

Throughout the year if I find bugs I should fix them where appropriate. If it's
a bug that only affects one course, then fixin that branch. But if it's
something present in multiple classes, then I should fixin main and merge
from main into the course branches. Since `main` should not be changing other
than from such fixes, hopefully those merges will be straightforward.

Then at the end of the school year, I will rename each of those branches to
include the academic year, e.g. `2022-23/itp`. Those renamed branches will be an
archive of where things were for that course at the end of the year. (Note the
name can't be `itp/2022-23` because then there can't also be an `itp` branch
because of the way git works.)

Then I will need to merge any good bits back to `main`. I probably don't want to
do that during the year in case I need to merge `main` to the other courses but
over the summer I want to collect everything in `main` and potentially take it
apart and rebuildto prepare for the next year.

One useful way to do that is actually to make a branch off of `main`, then
delete a bunch of stuff and build it back up with the `scripts/restore-files.sh`
script. At least that's what I did in summer 2023.
