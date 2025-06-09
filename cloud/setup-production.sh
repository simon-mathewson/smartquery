#!/bin/bash

pnpm install

# Fetch database secret from AWS Secrets Manager and create .env file
# SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id $DABASE_CLOUD_DB_SECRET_ARN --query SecretString --output text)
SECRET_JSON=$DABASE_CLOUD_DB_SECRET_ARN
echo $SECRET_JSON

# Extract username and password from secret JSON
DB_USERNAME=$(echo $SECRET_JSON | jq -r '.username')
DB_PASSWORD=$(echo $SECRET_JSON | jq -r '.password')

# Construct DATABASE_URL using the RDS endpoint and credentials
echo "DATABASE_URL=\"postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DABASE_CLOUD_DB_ENDPOINT}/dabase_cloud?schema=public\"" > .env

pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
pnpm start-production
