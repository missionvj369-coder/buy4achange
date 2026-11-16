# Hosting Buy4AChange on Cloudflare Workers & Cloudflare D1

This project has been pre-architected with **Cloudflare Workers** and **Cloudflare D1 (Global SQLite Database)** compatibility from Day 1.

All required files are already included in this repository:
- `worker/index.ts`: Edge Worker API router connecting to `env.BUY4ACHANGE_DB`
- `server/schema.sql`: Pure SQLite schema 100% compliant with Cloudflare D1
- `wrangler.toml`: Cloudflare deployment manifest

---

## 📋 Step-by-Step Deployment Guide

### Prerequisites
Make sure you have a free or paid Cloudflare account and have logged into Wrangler:
```bash
npx wrangler login
```

---

### Step 1: Create the Cloudflare D1 Database
Run the following command to provision a globally replicated SQLite database on Cloudflare's network:
```bash
npx wrangler d1 create buy4achange-db
```
Wrangler will output something like:
```toml
[[d1_databases]]
binding = "BUY4ACHANGE_DB"
database_name = "buy4achange-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the generated `database_id` into your `wrangler.toml` file:
```toml
[[d1_databases]]
binding = "BUY4ACHANGE_DB"
database_name = "buy4achange-db"
database_id = "paste-your-database-id-here"
```

---

### Step 2: Initialize Database Tables on Cloudflare D1
Execute the SQL schema on your remote Cloudflare D1 database:
```bash
npx wrangler d1 execute buy4achange-db --file=server/schema.sql --remote
```

To also populate your D1 database with initial UGT causes and products:
1. Open the Admin Portal in Buy4AChange at `http://localhost:5000`
2. Navigate to the **Cloudflare D1 & Worker** tab
3. Click **"Export Cloudflare D1 SQL"** (or use `http://localhost:5000/api/admin/cloudflare/export-d1`)
4. Save the file as `seed_d1.sql` and run:
```bash
npx wrangler d1 execute buy4achange-db --file=seed_d1.sql --remote
```

---

### Step 3: Test the Cloudflare Worker Locally
You can test the Edge Worker connected to your local D1 emulator before going live:
```bash
npx wrangler dev worker/index.ts --d1 BUY4ACHANGE_DB
```
Your worker will start on `http://localhost:8787` with full edge database support!

---

### Step 4: Deploy the Cloudflare Worker API to Production
Deploy the Edge Worker to Cloudflare's global edge network (over 300+ data centers worldwide):
```bash
npx wrangler deploy
```
Cloudflare will provide your live Worker URL (e.g., `https://buy4achange-worker.<your-subdomain>.workers.dev`).

---

### Step 5: Deploy the Frontend to Cloudflare Pages
Build the production frontend and deploy to Cloudflare Pages:
```bash
# 1. Build the frontend
npm run build

# 2. Deploy dist/ directory to Cloudflare Pages
npx wrangler pages deploy dist --project-name buy4achange
```
Your conscious commerce platform will now be live worldwide with ultra-low latency, zero cold starts, and a serverless global database!
