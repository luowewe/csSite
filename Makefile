# Remove make's default rules.
.SUFFIXES:

SHELL := bash -O globstar

# Tool setup

eslint_opts := --format unix
eslint_strict_opts := --rule 'no-console: 1'

# Files

all:
	npx @11ty/eleventy

setup:
	npm install

pretty:
	prettier --write .eleventy.js '**/*.js' '**/*.css' '**/*.json'

tidy:
	tidy -config .tidyconfig src/**/*.html

lint:
	npx eslint $(eslint_opts) js/**/*.js

fixmes:
	ag --no-group FIXME

ready: pretty lint


strict_lint:
	npx eslint $(eslint_opts) $(eslint_strict_opts) *.js modules/*.js

quick_lint:
	npx eslint $(eslint_opts) --fix $(shell git diff --name-only | grep '.js$$')

serve:
	npx @11ty/eleventy --serve

publish:
	./publish.sh _site

clean:
	rm -rf ./_site
	find . -name '*~' -delete

pristine:
	git clean -fdx

purged: | cleancss
	rm -rf cleancss/*
	purgecss --config purgecss.config.js
	cp css/prism.css cleancss

cleancss:
	mkdir $@


.PHONY: setup pretty tidy lint fixmes ready strict_lint serve publish clean pristine
