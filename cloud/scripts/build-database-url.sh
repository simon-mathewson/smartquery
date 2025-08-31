#!/bin/sh

# Extract username and password from secret JSON
DB_USERNAME=$(echo $SMARTQUERY_CLOUD_DB_SECRET | jq -r '.username')
DB_PASSWORD=$(echo $SMARTQUERY_CLOUD_DB_SECRET | jq -r '.password')
DB_HOST=$(echo $SMARTQUERY_CLOUD_DB_SECRET | jq -r '.host')
DB_NAME=$(echo $SMARTQUERY_CLOUD_DB_SECRET | jq -r '.dbname')
DB_PORT=$(echo $SMARTQUERY_CLOUD_DB_SECRET | jq -r '.port')

# URL encode the password
ENCODED_PASSWORD=$(echo "$DB_PASSWORD" | awk 'BEGIN { for (i = 0; i <= 255; i++) ord[sprintf("%c", i)] = i }
{
    for (i = 1; i <= length($0); i++) {
        c = substr($0, i, 1)
        if (c ~ /[a-zA-Z0-9.~_-]/) printf c
        else printf "%%%02X", ord[c]
    }
}')

# Output the complete DATABASE_URL
echo "postgresql://${DB_USERNAME}:${ENCODED_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public" 
