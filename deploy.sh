#!/bin/bash
# BOM Categorizer - Deploy to AWS (S3 + CloudFront)
# Usage: ./deploy.sh
#
# Prerequisites:
#   1. AWS credentials configured (see README)
#   2. npm install done in infra/

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INFRA_DIR="$SCRIPT_DIR/infra"

echo "🔧 Installing CDK dependencies..."
cd "$INFRA_DIR"
npm install --silent

echo "🚀 Deploying BOM Categorizer..."
npx cdk deploy --require-approval never

echo ""
echo "✅ Deployment complete!"
echo "📋 Your URL is printed above (SiteURL output)"
echo ""
echo "To update after code changes, just run: ./deploy.sh"
