#!/bin/bash

set -e

# Construct DATABASE_URL using the RDS endpoint and credentials
chmod +x ./scripts/build-database-url.sh
export DATABASE_URL=$(./scripts/build-database-url.sh)

# Move all *.node files to root of the app (unless already done)
if ls dist/*.node 1> /dev/null 2>&1; then
    mv dist/*.node .
fi

set -a
source .env.production
set +a

node dist/bundle.js
