#!/bin/bash

not=""

if [ "$1" = "-n" ]; then
    echo "Got -n";
    shift;
    not="yes"
fi

dir="$1"

if [ -z "$1" ]; then
    echo "Must provide directory.";
    exit 1;
fi

for f in $dir/*; do
    base=$(basename "$f")
    refs=$(ag --no-group $base)
    if [[ $not = "yes" ]]; then
        if [ -z "$refs" ]; then
            echo $f;
        fi
    else
        if [ -n "$refs" ]; then
            echo $f;
        fi
    fi
done


#echo -e "$f"; s $(basename "$f"); echo ""; done
