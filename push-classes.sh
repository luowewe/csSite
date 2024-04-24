#!/bin/bash

set -euo pipefail
set -x

for c in itp csa eng; do
    git switch $c
    git push
done

git switch main
