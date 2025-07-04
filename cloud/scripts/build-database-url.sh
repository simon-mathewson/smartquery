#!/bin/sh

DB_USERNAME=postgres

# URL encode the password
ENCODED_PASSWORD=$(echo "$DABASE_CLOUD_DB_SECRET" | awk 'BEGIN { for (i = 0; i <= 255; i++) ord[sprintf("%c", i)] = i }
{
    for (i = 1; i <= length($0); i++) {
        c = substr($0, i, 1)
        if (c ~ /[a-zA-Z0-9.~_-]/) printf c
        else printf "%%%02X", ord[c]
    }
}')

# Output the complete DATABASE_URL
echo "postgresql://${DB_USERNAME}:${ENCODED_PASSWORD}@${DABASE_CLOUD_DB_ENDPOINT}/dabase_cloud?schema=public" 
