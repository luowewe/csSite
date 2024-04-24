#!/bin/bash

f=$(mktemp)

cat config.json | jq -r '.testing.cases[] | { name, description } | "<div data-name=\(.name)><p>\(.description)</p></div>"'  > "$f"

prettier --parser html -w "$f" > /dev/null

cat "$f"
