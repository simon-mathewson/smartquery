#!/bin/bash

npm install -g pnpm
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
node dist/main.js
