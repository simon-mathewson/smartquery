#!/bin/bash

aws s3 sync . s3://smartquery-cloudformation --delete --exclude "*" --include "*.yml"

aws cloudformation deploy \
  --stack-name smartquery-2025-08-31-13-45-49 \
  --template-file main.yml \
  --capabilities CAPABILITY_NAMED_IAM
