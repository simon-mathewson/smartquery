# Manual steps

After creating stack from scratch, perform the following steps:

## 1. Initialize GitHub connection

Go to https://eu-central-1.console.aws.amazon.com/codesuite/settings/connections, select the pending connection, and click "Update pending connection". Log in to GitHub and click "Authorize". Install app to GitHub account.

## 2. Connect Domain

Go to https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones?region=eu-central-1, get the name servers from the hosted zone, and add them to the domain registrar: https://www.spaceship.com/application/advanced-dns-application/manage/dabase.dev/

## 3. Build and publish link:

```
cd link
pnpm build:all
pnpm run publish
```

To build for macOS and sign, ensure Apple Developer certificate is available in keychain:

1. Open XCode
2. XCode -> Settings -> Accounts -> Account -> Manage Certificates
3. If not present, add account and developer certificates
4. You may have to update electron-builder.env credentials
   1. Locate team ID here https://developer.apple.com/account#MembershipDetailsCard
   2. Generate app-specific password here https://account.apple.com/account/manage

## 4. Set UI env vars

- `VITE_AWS_COGNITO_IDENTITY_POOL_ID`
- `VITE_AWS_PINPOINT_APP_ID`
