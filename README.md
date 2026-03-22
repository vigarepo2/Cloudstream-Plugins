# CloudStream Bundle Manager

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/vigarepo2/Cloudstream-Plugins)

A lightweight, fast personal extension manager for CloudStream built on Cloudflare Workers. 

Instead of manually typing and managing multiple repository links on your TV or phone, this tool gives you a dense, mobile-optimized web dashboard to curate your plugins. Pick what you want in the UI, and your personal app links update instantly. Runs entirely on the Cloudflare free tier.

## Features

* **Smart Content Separation:** Automatically splits your selections and generates distinct URLs for Safe Content (SFW), Adult Content (NSFW), and a Master Bundle.
* **Ultra-Dense UI:** Built to show maximum information at once. Forces a tight 2-column grid on mobile and scales up to 8 columns on large screens. 
* **Instant Loading:** Uses SWR (Stale-While-Revalidate) caching on the frontend and Cloudflare KV on the backend so the dashboard loads instantly.
* **Resilient Fetching:** If one external plugin repository goes down, the backend uses `Promise.allSettled` to ensure the rest of your library still loads.
* **Custom Injections:** Paste any external `plugins.json` URL into the settings to merge it into your global library.

## Tech Stack

* **Backend:** Cloudflare Workers
* **Database:** Cloudflare D1 (Serverless SQLite)
* **Caching:** Cloudflare KV 
* **Frontend:** Vanilla JS & Tailwind CSS 

## Manual Setup (CLI)

If you prefer deploying via CLI instead of the button above:

1. Install Wrangler and login:
   ```bash
   npm install -g wrangler
   wrangler login

 * Create the Database & Cache:
   # Create the database
wrangler d1 create aether-db

# Create the KV cache
wrangler kv:namespace create CS_KV

   Note the database_id and the KV id output in the terminal.
 * Update wrangler.toml:
   Replace the placeholder IDs in your wrangler.toml file with the ones you just generated.
   [[d1_databases]]
binding = "CS_DB"
database_name = "aether-db"
database_id = "YOUR-D1-ID-HERE"

[[kv_namespaces]]
binding = "CS_KV"
id = "YOUR-KV-ID-HERE"

 * Deploy:
   npm run deploy

Usage
 * Initialize: Visit your deployed Worker URL. Click "Create a new workspace" to set up your admin username and password.
 * Curate: Go to the Extensions tab. Toggle the plugins you want. The app auto-saves your selections.
 * Sync: Go to the Dashboard tab. Copy your Safe Link, Adult Link, or Master Link.
 * Connect: Open CloudStream > Settings > Extensions > Add Repository > Paste your link.
Whenever you toggle a new plugin on your web dashboard, just restart CloudStream and it will sync automatically.
Disclaimer: This project does not host any streaming content. It acts as a proxy and manager for publicly available open-source plugin manifests.
