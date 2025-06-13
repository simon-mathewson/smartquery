#!/bin/sh

echo "$1" | awk 'BEGIN { for (i = 0; i <= 255; i++) ord[sprintf("%c", i)] = i }
{
    for (i = 1; i <= length($0); i++) {
        c = substr($0, i, 1)
        if (c ~ /[a-zA-Z0-9.~_-]/) printf c
        else printf "%%%02X", ord[c]
    }
}'
