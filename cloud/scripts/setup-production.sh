#!/bin/bash

# Extract username and password from secret JSON
DB_USERNAME=$(echo $DABASE_CLOUD_DB_SECRET | jq -r '.username')
DB_PASSWORD=$(echo $DABASE_CLOUD_DB_SECRET | jq -r '.password')

# Construct DATABASE_URL using the RDS endpoint and credentials
chmod +x ./scripts/build-database-url.sh
export DATABASE_URL=$(./scripts/build-database-url.sh)

pnpm install

pnpm start-production
