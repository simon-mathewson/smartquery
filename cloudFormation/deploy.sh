#!/bin/bash

aws s3 sync . s3://smartquery-cloudformation --delete --exclude "*" --include "*.yml"

aws cloudformation deploy \
  --stack-name smartquery-2025-01-18-19-40-48 \
  --template-file main.yml \
  --capabilities CAPABILITY_NAMED_IAM
