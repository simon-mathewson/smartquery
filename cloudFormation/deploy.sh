#!/bin/bash

aws s3 sync . s3://dabase-cloudformation --delete --exclude "*" --include "*.yml"

aws cloudformation deploy \
  --stack-name dabase-2025-01-18-19-40-48 \
  --template-file main.yml \
  --capabilities CAPABILITY_NAMED_IAM
