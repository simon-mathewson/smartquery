# Setup from scratch

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

### 3. Initialize GitHub connection

Go to https://eu-central-1.console.aws.amazon.com/codesuite/settings/connections, select the pending connection, and click "Update pending connection". Log in to GitHub and click "Authorize". Install app to GitHub account.

### 4. Connect Domain

Go to https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones?region=eu-central-1, get the name servers from the hosted zone, and add them to the domain registrar: https://www.spaceship.com/application/advanced-dns-application/manage/smartquery.dev/

### 5. Set up Stripe custom email domain

In Stripe settings -> Business -> Customer emails -> Your custom email domains set up smartquery.dev. Add value to Stripe records in cloudFormation/route53.yml.

### 6. Build and publish link:

```
cd link
pnpm build:all
pnpm run publish
```

If building fails with hdiutil error, enable IDE under macOS settings -> Privacy & Security -> App Management.

To build for macOS and sign, ensure Apple Developer certificate is available in keychain:

1. Open XCode
2. XCode -> Settings -> Accounts -> Account -> Manage Certificates
3. If not present, add account and developer certificates
4. You may have to update electron-builder.env credentials
   1. Locate team ID here https://developer.apple.com/account#MembershipDetailsCard
   2. Generate app-specific password here https://account.apple.com/account/manage

### 7. Create ACM certificates

In the AWS console, go to Certificate Manager, Request a certificate, and request a certificate for the following domains in both us-east-1 and eu-central-1 regions:

- `smartquery.dev`
- `*.smartquery.dev`

Replace `AcmCertificateArn` value in CloudFormation files with the ARN from us-east-1.

Replace the certificate ARN in the Elastic Beanstalk Stack with the ARN from eu-central-1.

### 8. Setup production DB access

1. Get key pair ID

```sh
aws ec2 describe-key-pairs
```

2. Get and store private key

```sh
aws ssm get-parameter --name /ec2/keypair/<KEY ID> --with-decryption --query Parameter.Value --output text > ~/.ssh/smartquery-bastion-key.pem

chmod 400 ~/.ssh/smartquery-bastion-key.pem
```

Production DB info:

SSH User: ec2-user
SSH Host: bastion.smartquery.dev
SSH Port: 22
SSH Key: ~/.ssh/smartquery-bastion-key.pem

DB Password, username, host, port, and name are stored in the secret manager:
https://eu-central-1.console.aws.amazon.com/secretsmanager/secret?name=smartquery-cloud-db-secret&region=eu-central-1

### 9. Update RUM script

Update `ui/src/setUpRum.ts` according to JS snippet displayed in https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#rum:dashboard/smartquery?tab=configuration.

Replace `APPLICATION_VERSION` with `import.meta.env.VITE_UI_VERSION`.

### 10. Update WAF script

Update `VITE_AWS_WAF_CAPTCHA_SCRIPT_URL` according to JS script URL displayed in https://us-east-1.console.aws.amazon.com/wafv2/homev2/application-integ-sdks?region=eu-central-1.

Create an API key with domain `smartquery.dev` in the console as update `VITE_AWS_WAF_CAPTCHA_API_KEY` accordingly.

### 11. Set Google AI API key secret

Get API Key from https://aistudio.google.com/apikey and insert it into the secret manager:
https://eu-central-1.console.aws.amazon.com/secretsmanager/listsecrets?region=eu-central-1
