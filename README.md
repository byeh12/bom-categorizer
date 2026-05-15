# BOM Categorizer

A web tool that auto-categorizes BOM (Bill of Materials) line items using the Ring/Yeti Category Logic.

**Live URL:** `https://<cloudfront-id>.cloudfront.net` (after deployment)

---

## Quick Deploy (One-Time Setup)

### 1. Get an AWS Account

You need an Isengard AWS account. If you don't have one:
- Go to https://isengard.amazon.com/manage-accounts
- Create a new account or use an existing team account

### 2. Configure AWS Credentials

```bash
# Option A: AWS SSO (recommended for Amazon)
aws configure sso
# SSO start URL: https://amzn.awsapps.com/start
# SSO Region: us-east-1
# Account: <your-account-id>
# Role: Admin or PowerUser
# Profile name: bom-tool

# Then set as default:
export AWS_PROFILE=bom-tool

# Option B: Isengard CLI (if installed)
isengardcli assume <account-alias> --role Admin
```

### 3. Deploy

```bash
cd ~/Desktop/KIRO/bom-categorizer
./deploy.sh
```

The script will output your CloudFront URL. Share that URL with your team — it works 24/7.

---

## Update & Redeploy

After editing `index.html` or `app.js`:

```bash
./deploy.sh
```

Changes go live in ~60 seconds (CloudFront cache invalidation).

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Browser   │────▶│  CloudFront  │────▶│  S3 Bucket │
│  (Amazonians)│     │   (HTTPS)    │     │  (static)  │
└─────────────┘     └──────────────┘     └────────────┘
```

- **S3**: Stores `index.html` + `app.js`
- **CloudFront**: HTTPS, global CDN, caching
- **No backend needed** — all categorization runs client-side in the browser

---

## File Structure

```
bom-categorizer/
├── index.html          # Main UI
├── app.js              # Categorization logic + Ring/Yeti rules
├── deploy.sh           # One-command deploy script
├── README.md
└── infra/
    ├── stack.ts        # CDK infrastructure (S3 + CloudFront)
    ├── package.json
    ├── tsconfig.json
    └── cdk.json
```

---

## Cost

Essentially free for internal use:
- S3: ~$0.01/month (2 files)
- CloudFront: Free tier covers 1TB/month
- No Lambda, no API Gateway, no database
