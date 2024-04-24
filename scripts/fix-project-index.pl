#!/usr/bin/env perl

use strict;
use warnings;

#$^I = '';

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
    if (/^layout:/) {
      print "layout: project\n";
      next;
    } elsif (/^(class):/) {
      next;
    } elsif (/^script: questions/) {
      next;
    } elsif (/^---/) {
      $state = 'after_header';
    }
  }
  print;
}
