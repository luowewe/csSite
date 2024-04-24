#!/bin/bash

#
# Find directories under a given dirctory that are in a given branch (default to
# main) and not in the current branch (and workspace)
#
#

set -euo pipefail

dir="${1:-.}"
depth="${2:-999}"
branch="${3:-main}"

old=$(mktemp)
new=$(mktemp)

git ls-tree -r --name-only "$branch" "$dir" | while read -r f; do
    echo $(dirname "$f") | cut -d / -f "-$depth"
done | sort | uniq > $old

git ls-tree -r --name-only HEAD "$dir" | while read -r f; do
    echo $(dirname "$f") | cut -d / -f "-$depth"
done | sort | uniq > $new

comm -23 $old $new | egrep -v 'advent-of-code|assessments|assignments|gallery|_layouts|demo|fib|factorial'
