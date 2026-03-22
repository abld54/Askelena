#!/bin/bash
set -e

# Install Node.js dependencies and build static site
corepack enable
pnpm install
npx prisma generate
npx prisma db push --accept-data-loss
pnpm run build
npx tsx prisma/seed.ts

# Install Python dependencies
pip install -r requirements.txt
