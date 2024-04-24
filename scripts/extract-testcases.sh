#!/bin/bash

cat config.json | jq '[.testing.cases[] | { key: .name, value: [.cases[] | .args]  }] | from_entries' | prettier --parser json
