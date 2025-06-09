#!/bin/bash

urlencode() {
    # urlencode <string>
    local length="${#1}"
    for (( i = 0; i < length; i++ )); do
        local c="${1:i:1}"
        case $c in
            [a-zA-Z0-9.~_-]) printf "$c" ;;
            *) printf '%%%02X' "'$c"
        esac
    done
}

pnpm install

# Extract username and password from secret JSON
DB_USERNAME=$(echo $DABASE_CLOUD_DB_SECRET | jq -r '.username')
DB_PASSWORD=$(echo $DABASE_CLOUD_DB_SECRET | jq -r '.password')

# Construct DATABASE_URL using the RDS endpoint and credentials
export DATABASE_URL="postgresql://${DB_USERNAME}:$(urlencode $DB_PASSWORD)@${DABASE_CLOUD_DB_ENDPOINT}/dabase_cloud?schema=public"

set -e  # Exit immediately if a command exits with a non-zero status
pnpm prisma migrate deploy

pnpm start-production
