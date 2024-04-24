#!/bin/bash

#
# Restore files that have been deleted in the current branch that exist in some
# other branch or commit or other tree like thing.
#

set -euo pipefail

dir="$1"
branch="${2:-main}"

git ls-tree -r --name-only "$branch" "$dir" | while read -r f; do
    h=$(git log -1 --pretty=tformat:%H -- "$f")
    git checkout "$h^" -- "$f"
done

#cp assessments/unit-01/config.json "$dir"

# For converting old liquid based templates
#find "$dir" -name index.html | while read -r f; do
#    git mv "$f" "${f%.*}.njk"
#done

#git mv "$dir/index.html" "$dir/index.njk"

# Hack for converting assessment index files.
#./scripts/fix-index.pl "$dir/index.njk"

#$EDITOR "$dir/index.njk"
