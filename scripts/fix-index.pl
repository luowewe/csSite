#!/usr/bin/env perl

use strict;
use warnings;

$^I = '';

my $state = 'init';

my $open_divs = 0;

while (<>) {
  if ($state eq 'init') {
    if (/^---/) {
      $state = 'header';
    } else {
      die "Don't grok $_ in state $state.\n";
    }
  } elsif ($state eq 'header') {
    if (/^(layout|date|style|tags):/) {
      next;
    } elsif (/^script: questions/) {
      next;
    } elsif (/^---/) {
      $state = 'after_header';
    }
  } elsif ($state eq 'after_header') {
    print "\n{% extends 'code-assessment.njk' %}\n\n";
    $state = 'before_instructons';
    next;
  } elsif ($state eq 'before_instructons') {
    if (/<div id="instructions">/) {
      print "{% block instructions %}\n";
      $state = 'in_instructions';
    }
    next;
  } elsif ($state eq 'in_instructions') {
    if (/<\/div>/) {
      $state = 'after_instructions';
      print "{% endblock %}\n";
      next;
    }
  } elsif ($state eq 'after_instructions') {
    if (/<div id="questions">/) {
      print "\n\n{% block questions %}\n";
      $state = 'in_questions';
    }
    next;
  } elsif ($state eq 'in_questions') {
    if (/<div>/) {
      $open_divs++;
    } elsif (/<\/div>/) {
      $open_divs--;
    }
    if ($open_divs < 0) {
      $state = 'done';
      print "{% endblock %}\n";
      last;
    }
  }
  print;
}
