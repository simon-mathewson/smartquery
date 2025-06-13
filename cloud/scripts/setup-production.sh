#!/bin/bash

# Extract username and password from secret JSON
DB_USERNAME=$(echo $DABASE_CLOUD_DB_SECRET | jq -r '.username')
DB_PASSWORD=$(echo $DABASE_CLOUD_DB_SECRET | jq -r '.password')

# Construct DATABASE_URL using the RDS endpoint and credentials
source scripts/urlencode.sh
export DATABASE_URL="postgresql://${DB_USERNAME}:$(urlencode $DB_PASSWORD)@${DABASE_CLOUD_DB_ENDPOINT}/dabase_cloud?schema=public"

pnpm install

pnpm start-production
