#!/bin/bash

#
# Find directories under a given dirctory that are in a given branch (default to
# main) and not in the current branch (and workspace)
#
#

set -euo pipefail

dir="${1:-.}"
branch="${3:-main}"

old=$(mktemp)
new=$(mktemp)

git ls-tree -r --name-only "$branch" "$dir" | sort | uniq > $old
git ls-tree -r --name-only HEAD "$dir" | sort | uniq > $new

comm -23 $old $new | egrep -v 'assessments|assignments|\.liquid|gallery'
