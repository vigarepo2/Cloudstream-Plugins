import { uiHTML } from "./frontend.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });
}

async function hashData(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateId(length = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) return 'N/A';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// -----------------------------------------------------
// DATABASE SETUP (USING NEW TABLE NAMES TO AVOID ERRORS)
// -----------------------------------------------------
async function ensureDb(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS accounts (username TEXT PRIMARY KEY, password TEXT, session_token TEXT UNIQUE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS user_configs (username TEXT PRIMARY KEY, selected TEXT DEFAULT '[]', custom_sources TEXT DEFAULT '[]')`)
  ]);
}

// -----------------------------------------------------
// AGGREGATOR LOGIC
// -----------------------------------------------------
const DEFAULT_SOURCES = [
  "https://raw.githubusercontent.com/SaurabhKaperwan/CSX/builds/plugins.json",
  "https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/refs/heads/builds/plugins.json",
  "https://raw.githubusercontent.com/NivinCNC/CNCVerse-Cloud-Stream-Extension/builds/plugins.json",
  "https://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds/plugins.json",
  "https://raw.githubusercontent.com/rockhero1234/cinephile/builds/plugins.json",
  "https://raw.githubusercontent.com/Sushan64/NetMirror-Extension/builds/plugins.json",
  "https://cloudstream.lasyhost.tech/plugins.json",
  "https://raw.githubusercontent.com/crafteraadarsh/vibemax/builds/plugins.json"
];

async function fetchSource(url, depth = 0) {
  if (depth > 2) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true }, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    let coll = [];
    if (Array.isArray(data)) coll = data;
    else {
      if (data.plugins && Array.isArray(data.plugins)) coll = coll.concat(data.plugins);
      if (data.pluginLists && Array.isArray(data.pluginLists)) {
        const sub = await Promise.all(data.pluginLists.map(u => fetchSource(u, depth + 1)));
        coll = coll.concat(sub.flat());
      }
    }
    return coll;
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }
}

async function getBundledExtensions(customUrls = []) {
  const allUrls = [...DEFAULT_SOURCES, ...(customUrls || [])];
  const promises = allUrls.map(url => fetchSource(url));
  const results = await Promise.all(promises);
  const rawList = results.flat();
  
  const processed = [];
  const namesMap = new Map(); // For tracking duplicates

  for (const item of rawList) {
    if (!item || typeof item !== 'object' || !item.name || item.status === 0) continue;
    
    // DUPLICATE HANDLER LOGIC
    let baseName = item.name;
    if (namesMap.has(baseName)) {
      const count = namesMap.get(baseName) + 1;
      namesMap.set(baseName, count);
      item.name = `${baseName} (${count})`; // Changes Display Name
      item.internalName = `${item.internalName || baseName.replace(/\s+/g, '')}_${count}`; // Changes ID
    } else {
      namesMap.set(baseName, 1);
      item.internalName = item.internalName || baseName.replace(/\s+/g, '');
    }
    
    let typesArray = [];
    try {
        if (Array.isArray(item.tvTypes)) typesArray = item.tvTypes.map(t => typeof t === 'string' ? t.trim() : '');
        else if (typeof item.tvTypes === 'string') typesArray = item.tvTypes.split(',').map(t => t.trim());
        else if (typeof item.type === 'string') typesArray = item.type.split(',').map(t => t.trim());
    } catch(e) {}
    
    item.tvTypes = typesArray.filter(t => t.length > 0);
    if(item.tvTypes.length === 0) item.tvTypes = ["VOD"];
    
    item.isAdult = item.tvTypes.some(t => t.toUpperCase() === "NSFW");
    item.formattedSize = formatBytes(item.fileSize);
    
    processed.push(item);
  }
  return processed.sort((a, b) => a.name.localeCompare(b.name));
}

// -----------------------------------------------------
// MAIN WORKER LOGIC
// -----------------------------------------------------
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const token = request.headers.get("Authorization");

    // === AUTHENTICATION ===
    if (path === "/api/auth" && method === "POST") {
      try {
        await ensureDb(env.CS_DB); 
        const body = await request.json();
        const username = body.username?.trim().toLowerCase();
        if (!username || !body.password) return json({ error: "Missing fields" }, 400);
        const hash = await hashData(body.password);

        if (body.action === "signup") {
          const exists = await env.CS_DB.prepare("SELECT username FROM accounts WHERE username = ?").bind(username).first();
          if (exists) return json({ error: "Username taken" }, 400);
          
          const session = generateId(24);
          await env.CS_DB.batch([
            env.CS_DB.prepare("INSERT INTO accounts (username, password, session_token) VALUES (?, ?, ?)").bind(username, hash, session),
            env.CS_DB.prepare("INSERT INTO user_configs (username) VALUES (?)").bind(username)
          ]);
          return json({ token: session, username });
        }

        if (body.action === "login") {
          const user = await env.CS_DB.prepare("SELECT password, session_token FROM accounts WHERE username = ?").bind(username).first();
          if (!user) return json({ error: "user_not_found" }, 401);
          if (user.password !== hash) return json({ error: "wrong_password" }, 401);
          return json({ token: user.session_token, username });
        }
      } catch (e) { return json({ error: "System Error" }, 500); }
    }

    // === USER SETTINGS (UPDATE CREDS) ===
    if (path === "/api/me/credentials" && method === "PUT") {
        if (!token) return json({ error: "Unauthorized" }, 401);
        await ensureDb(env.CS_DB);
        const user = await env.CS_DB.prepare("SELECT username, password FROM accounts WHERE session_token = ?").bind(token).first();
        if (!user) return json({ error: "Unauthorized" }, 401);

        const body = await request.json();
        const newUsername = body.username?.trim().toLowerCase();
        const newPassword = body.password;

        if (!newUsername && !newPassword) return json({ error: "No changes requested" }, 400);

        let finalUsername = user.username;
        let finalPassword = user.password;

        if (newUsername && newUsername !== user.username) {
            const exists = await env.CS_DB.prepare("SELECT username FROM accounts WHERE username = ?").bind(newUsername).first();
            if (exists) return json({ error: "Username already taken" }, 400);
            finalUsername = newUsername;
        }

        if (newPassword) {
            finalPassword = await hashData(newPassword);
        }

        // Update tables and clear caches
        await env.CS_DB.batch([
            env.CS_DB.prepare("UPDATE accounts SET username = ?, password = ? WHERE session_token = ?").bind(finalUsername, finalPassword, token),
            env.CS_DB.prepare("UPDATE user_configs SET username = ? WHERE username = ?").bind(finalUsername, user.username)
        ]);

        await env.CS_KV.delete(`repo_${user.username}_sfw`);
        await env.CS_KV.delete(`repo_${user.username}_nsfw`);

        return json({ success: true, username: finalUsername });
    }

    // === GET/UPDATE SELECTIONS & SOURCES ===
    if (path === "/api/me" && method === "GET") {
        if (!token) return json({ error: "Unauthorized" }, 401);
        await ensureDb(env.CS_DB);
        const user = await env.CS_DB.prepare("SELECT username FROM accounts WHERE session_token = ?").bind(token).first();
        if (!user) return json({ error: "Unauthorized" }, 401);

        const config = await env.CS_DB.prepare("SELECT selected, custom_sources FROM user_configs WHERE username = ?").bind(user.username).first();
        return json({
            selected: JSON.parse(config?.selected || '[]'),
            sources: JSON.parse(config?.custom_sources || '[]')
        });
    }

    if (path === "/api/me/plugins" && method === "POST") {
        if (!token) return json({ error: "Unauthorized" }, 401);
        await ensureDb(env.CS_DB);
        const user = await env.CS_DB.prepare("SELECT username FROM accounts WHERE session_token = ?").bind(token).first();
        if (!user) return json({ error: "Unauthorized" }, 401);

        const body = await request.json();
        await env.CS_DB.prepare("UPDATE user_configs SET selected = ?, custom_sources = ? WHERE username = ?")
            .bind(JSON.stringify(body.selected), JSON.stringify(body.sources), user.username).run();

        // Clear cache so repo updates instantly
        await env.CS_KV.delete(`repo_${user.username}_sfw`);
        await env.CS_KV.delete(`repo_${user.username}_nsfw`);
        return json({ success: true });
    }

    // === GET ALL PLUGINS ===
    if (path === "/api/plugins" && method === "GET") {
        if (!token) return json({ error: "Unauthorized" }, 401);
        await ensureDb(env.CS_DB);
        const user = await env.CS_DB.prepare("SELECT username FROM accounts WHERE session_token = ?").bind(token).first();
        if (!user) return json({ error: "Unauthorized" }, 401);

        const config = await env.CS_DB.prepare("SELECT custom_sources FROM user_configs WHERE username = ?").bind(user.username).first();
        const customUrls = JSON.parse(config?.custom_sources || '[]');
        const data = await getBundledExtensions(customUrls);
        return json(data);
    }

    // === MAGIC REPOSITORY DELIVERY ROUTE ===
    // Matches: /username/sfw/repo.json
    const repoMatch = path.match(/^\/([a-zA-Z0-9_-]+)\/(sfw|nsfw)\/(repo|plugins)\.json$/);
    if (repoMatch && method === "GET") {
      let reqUsername = repoMatch[1];
      let mode = repoMatch[2];
      let file = repoMatch[3];

      await ensureDb(env.CS_DB);
      const userCheck = await env.CS_DB.prepare("SELECT username FROM accounts WHERE username = ?").bind(reqUsername).first();
      if (!userCheck) return json({ error: "Repository Not Found" }, 404);

      if (file === "repo") {
        return json({
          name: `My CS - ${mode === 'sfw' ? 'Standard Library' : 'Adult 18+'}`,
          description: `Personal synchronized repository.`,
          manifestVersion: 1,
          pluginLists: [`${url.origin}/${reqUsername}/${mode}/plugins.json`]
        });
      }

      if (file === "plugins") {
        const cacheKey = `repo_${reqUsername}_${mode}`;
        const cached = await env.CS_KV.get(cacheKey);
        if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", ...CORS } });

        const config = await env.CS_DB.prepare("SELECT selected, custom_sources FROM user_configs WHERE username = ?").bind(reqUsername).first();
        const selectedSet = new Set(JSON.parse(config?.selected || '[]'));
        const customUrls = JSON.parse(config?.custom_sources || '[]');
        
        const allExt = await getBundledExtensions(customUrls);
        const finalExt = allExt.filter(p => {
          if (!selectedSet.has(p.internalName)) return false; 
          if (mode === "sfw" && p.isAdult) return false;
          if (mode === "nsfw" && !p.isAdult) return false;
          return true;
        });

        const resData = JSON.stringify(finalExt);
        await env.CS_KV.put(cacheKey, resData, { expirationTtl: 300 });
        return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }
    }

    // === SPA ROUTER (CATCH-ALL FOR REFRESHES) ===
    if (!path.startsWith('/api/') && !path.endsWith('.json')) {
      return new Response(uiHTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return json({ error: "Not found" }, 404);
  }
};
