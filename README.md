# 🎬 My CloudStream Hub

A lightning-fast, personal extension manager for CloudStream. Built on Cloudflare Workers, this tool gives you a beautiful web dashboard to curate, manage, and instantly sync your favorite CloudStream plugins directly to your devices.

Say goodbye to manually typing repository links. Just pick what you want in the web UI, and your personal app links will update instantly.

## ✨ Features

* **📱 Premium Web Dashboard:** A sleek, mobile-optimized, app-like interface to manage your plugins.
* **⚡ Ultra-Fast Caching:** Powered by Cloudflare KV. Your repositories load instantly without hitting rate limits.
* **🛡️ Smart Separation:** Automatically generates two distinct links: one for Standard Content (SFW) and one for Adult Content (18+ NSFW).
* **🔗 Custom Sources:** Easily add any external `plugins.json` URL to expand your library.
* **🔄 Auto-Sync & Refresh:** Select or deselect plugins, and your CloudStream app links update automatically. Use the manual refresh button to fetch the latest plugin updates from developers.
* **👯 Duplicate Handling:** Automatically resolves name conflicts if two plugins share the exact same name.
* **🔒 Secure Sessions:** Persistent login sessions and customizable credentials.

---

## 🛠️ Prerequisites

Before you begin, ensure you have:
1. A [Cloudflare](https://dash.cloudflare.com/) account.
2. [Node.js](https://nodejs.org/) installed on your computer.

---

## 🚀 Installation & Deployment

Follow these steps to deploy your personal hub to Cloudflare Workers.

### 1. Setup your environment
Open your terminal and install Wrangler (Cloudflare's official CLI tool):
\`\`\`bash
npm install -g wrangler
\`\`\`

Log in to your Cloudflare account:
\`\`\`bash
wrangler login
\`\`\`

### 2. Create the Database (D1) and Cache (KV)
Run these two commands to create the storage spaces for your app:

**Create the Database:**
\`\`\`bash
wrangler d1 create aether-db
\`\`\`
*(Save the `database_id` it gives you).*

**Create the KV Cache:**
\`\`\`bash
wrangler kv:namespace create CS_KV
\`\`\`
*(Save the `id` it gives you).*

### 3. Update Configuration
Open the `wrangler.toml` file in this project. Replace the placeholder IDs with the real ones you just generated:

\`\`\`toml
name = "cs-addon"
main = "src/index.js"
compatibility_date = "2024-03-21"

[[d1_databases]]
binding = "CS_DB"
database_name = "aether-db"
database_id = "YOUR-NEW-D1-ID-HERE"

[[kv_namespaces]]
binding = "CS_KV"
id = "YOUR-NEW-KV-ID-HERE"
\`\`\`

### 4. Deploy!
Finally, push your code live to the edge:
\`\`\`bash
npm run deploy
\`\`\`

---

## 🎮 How to Use

1. **Create an Account:** Visit your newly deployed Cloudflare Worker URL. You will see the login page. Click **Create Account** to set up your username and password. *(The app will automatically build the necessary database tables behind the scenes).*
2. **Select Plugins:** Navigate to the **Plugins** tab in the dashboard. Check the boxes next to the extensions you want to install.
3. **Add Custom Sources (Optional):** In the Plugins tab, you can paste external `plugins.json` links to bring in more extensions.
4. **Copy Your Links:** Go to the **Home** dashboard. Copy your personal **Safe Library** or **Adult Library** links.
5. **Paste into CloudStream:** Open the CloudStream app on your phone or TV, go to Settings > Extensions > Add Repository, and paste your personal link.

Whenever you want to add or remove a plugin, just do it from your web dashboard. Your CloudStream app will sync the changes automatically!

---

## ⚙️ Tech Stack

* **Backend:** Cloudflare Workers (Serverless Edge Computing)
* **Database:** Cloudflare D1 (Serverless SQLite)
* **Caching:** Cloudflare KV (Key-Value Storage)
* **Frontend:** Vanilla JavaScript, HTML5, Tailwind CSS (No heavy frameworks!)
