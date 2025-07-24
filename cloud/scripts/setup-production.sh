#!/bin/bash

set -e

# Construct DATABASE_URL using the RDS endpoint and credentials
chmod +x ./scripts/build-database-url.sh
export DATABASE_URL=$(./scripts/build-database-url.sh)

# Move all *.node files to root of the app
mv dist/*.node .

set -a
source .env.production
set +a

node dist/bundle.js
