# Cloud infrastructure

This folder contains AWS CloudFormation templates for deploying SmartQuery.

## Setup from scratch

### 1. Create S3 buckets

```
aws s3 mb s3://smartquery-cloudformation --region eu-central-1
```

### 2. Create stack

These commands should be kept in sync with cloudFormation/deploy.sh.

```sh
cd ../cloudFormation

aws s3 sync . s3://smartquery-cloudformation --delete --exclude "*" --include "*.yml"

aws cloudformation create-stack \
   --stack-name smartquery-$(date +%Y-%m-%d-%H-%M-%S) \
   --template-url https://smartquery-cloudformation.s3.eu-central-1.amazonaws.com/main.yml \
   --capabilities CAPABILITY_NAMED_IAM
```

Add the new stack name to the deploy.sh script.

### 3. Initialize GitHub connection

Go to https://eu-central-1.console.aws.amazon.com/codesuite/settings/connections, select the pending connection, and click "Update pending connection". Log in to GitHub and click "Authorize". Install app to GitHub account.

### 4. Connect Domain

Go to https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones?region=eu-central-1, get the name servers from the hosted zone, and add them to the domain registrar: https://www.spaceship.com/application/advanced-dns-application/manage/smartquery.dev/

### 5. Build and publish desktop:

```
cd desktop
pnpm build:all
```

If building fails with hdiutil error, enable IDE under macOS settings -> Privacy & Security -> App Management.

To build for macOS and sign, ensure Apple Developer certificate is available in keychain:

1. Open XCode
2. XCode -> Settings -> Accounts -> Account -> Manage Certificates
3. If not present, add account and developer certificates
4. You may have to update electron-builder.env credentials
   1. Locate team ID here https://developer.apple.com/account#MembershipDetailsCard
   2. Generate app-specific password here https://account.apple.com/account/manage

### 6. Create ACM certificates

In the AWS console, go to Certificate Manager, Request a certificate, and request a certificate for the following domains in us-east-1:

- `smartquery.dev`
- `*.smartquery.dev`

Replace `AcmCertificateArn` value in CloudFormation files with the ARN from us-east-1.

### 7. Update RUM script

Update `ui/src/content/errors/tracking/useErrorTracking.ts` according to JS snippet displayed in https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#rum:dashboard/smartquery?tab=configuration (Identity Pool ID, Application ID)

Replace `APPLICATION_VERSION` with `import.meta.env.VITE_UI_VERSION`.

### 8. Update WAF script

Update `VITE_AWS_WAF_CAPTCHA_SCRIPT_URL` according to JS script URL displayed in https://us-east-1.console.aws.amazon.com/wafv2/homev2/application-integ-sdks?region=eu-central-1 -> CAPTCHA integration.

Create an API key with domain `smartquery.dev` in the console and update `VITE_AWS_WAF_CAPTCHA_API_KEY` accordingly.
