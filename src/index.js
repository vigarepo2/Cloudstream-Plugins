import { uiHTML } from "./frontend.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });
}

async function hashPassword(str) {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function cleanUsername(username) {
  if (!username) return "";
  return username.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function ensureDb(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT, token TEXT UNIQUE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS links (link_id TEXT PRIMARY KEY, username TEXT, name TEXT, is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS analytics (link_id TEXT, visitor_hash TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`)
  ]);
}

async function trackClick(db, linkId, request) {
  try {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    const date = new Date().toISOString().split('T')[0];
    const visitorHash = await hashPassword(`${ip}-${ua}-${date}`);
    await db.prepare("INSERT INTO analytics (link_id, visitor_hash) VALUES (?, ?)").bind(linkId, visitorHash).run();
  } catch(e) {}
}

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
    if (Array.isArray(data)) return data;
    if (data.plugins && Array.isArray(data.plugins)) return data.plugins;
    if (data.pluginLists && Array.isArray(data.pluginLists)) {
      const subPromises = data.pluginLists.map(subUrl => fetchSource(subUrl, depth + 1));
      const subResults = await Promise.all(subPromises);
      return subResults.flat();
    }
    return [];
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }
}

async function getExtensions() {
  const promises = DEFAULT_SOURCES.map(url => fetchSource(url));
  const results = await Promise.all(promises);
  const rawList = results.flat();
  
  const processed = [];
  const names = new Map();

  for (const item of rawList) {
    if (!item || typeof item !== 'object' || !item.name || item.status === 0) continue;
    let key = item.internalName || item.name.replace(/\s+/g, '');
    if (names.has(key)) {
      const count = names.get(key) + 1;
      names.set(key, count);
      item.internalName = `${key}_${count}`;
    } else {
      names.set(key, 1);
      item.internalName = key;
    }
    processed.push(item);
  }
  return processed;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const token = request.headers.get("Authorization");

    if (path === "/api/auth" && method === "POST") {
      try {
        await ensureDb(env.CS_DB); 
        const body = await request.json();
        const username = cleanUsername(body.username);
        if (!username || !body.password) return jsonRes({ error: "Username and password required" }, 400);
        const hash = await hashPassword(body.password);

        if (body.action === "signup") {
          const exists = await env.CS_DB.prepare("SELECT username FROM users WHERE username = ?").bind(username).first();
          if (exists) return jsonRes({ error: "Username already taken" }, 400);
          const newToken = generateToken(24);
          await env.CS_DB.prepare("INSERT INTO users (username, password, token) VALUES (?, ?, ?)").bind(username, hash, newToken).run();
          return jsonRes({ token: newToken, username });
        }

        if (body.action === "login") {
          const user = await env.CS_DB.prepare("SELECT password, token FROM users WHERE username = ?").bind(username).first();
          if (!user) return jsonRes({ error: "user_not_found" }, 401);
          if (user.password !== hash) return jsonRes({ error: "wrong_password" }, 401);
          return jsonRes({ token: user.token, username });
        }
      } catch (e) { return jsonRes({ error: "System error: " + e.message }, 500); }
    }

    if (path.startsWith("/api/links")) {
      if (!token) return jsonRes({ error: "Unauthorized" }, 401);
      await ensureDb(env.CS_DB);
      const user = await env.CS_DB.prepare("SELECT username FROM users WHERE token = ?").bind(token).first();
      if (!user) return jsonRes({ error: "Unauthorized" }, 401);

      if (method === "GET") {
        const query = `
          SELECT l.*, 
          COUNT(a.timestamp) as total_clicks,
          COUNT(DISTINCT a.visitor_hash) as unique_visitors
          FROM links l
          LEFT JOIN analytics a ON l.link_id = a.link_id
          WHERE l.username = ?
          GROUP BY l.link_id
          ORDER BY l.created_at DESC
        `;
        const { results } = await env.CS_DB.prepare(query).bind(user.username).all();
        return jsonRes(results);
      }

      if (method === "POST" && path === "/api/links") {
        const body = await request.json();
        let linkId = body.id ? body.id.toLowerCase().replace(/[^a-z0-9]/g, '') : generateToken(10);
        if (linkId.length === 0) linkId = generateToken(10);
        
        const exists = await env.CS_DB.prepare("SELECT link_id FROM links WHERE link_id = ?").bind(linkId).first();
        if (exists) return jsonRes({ error: "Custom ID already taken" }, 400);

        await env.CS_DB.prepare("INSERT INTO links (link_id, username, name) VALUES (?, ?, ?)").bind(linkId, user.username, body.name).run();
        return jsonRes({ success: true, linkId });
      }

      const linkMatch = path.match(/^\/api\/links\/([a-zA-Z0-9]+)$/);
      if (linkMatch) {
        const targetId = linkMatch[1];
        const linkData = await env.CS_DB.prepare("SELECT username FROM links WHERE link_id = ?").bind(targetId).first();
        if(!linkData || linkData.username !== user.username) return jsonRes({ error: "Not found" }, 404);

        if (method === "PUT") {
          const body = await request.json();
          await env.CS_DB.prepare("UPDATE links SET is_active = ? WHERE link_id = ?").bind(body.is_active, targetId).run();
          await env.CS_KV.delete(`repo_${targetId}_sfw`);
          await env.CS_KV.delete(`repo_${targetId}_nsfw`);
          return jsonRes({ success: true });
        }

        if (method === "DELETE") {
          await env.CS_DB.batch([
            env.CS_DB.prepare("DELETE FROM links WHERE link_id = ?").bind(targetId),
            env.CS_DB.prepare("DELETE FROM analytics WHERE link_id = ?").bind(targetId)
          ]);
          await env.CS_KV.delete(`repo_${targetId}_sfw`);
          await env.CS_KV.delete(`repo_${targetId}_nsfw`);
          return jsonRes({ success: true });
        }
      }
    }

    const repoMatch = path.match(/^\/(?:([a-zA-Z0-9]+)\/)?(sfw|nsfw)\/(repo|plugins)\.json$/);
    if (repoMatch && method === "GET") {
      let linkId = repoMatch[1] || 'default';
      let mode = repoMatch[2];
      let file = repoMatch[3];

      if (linkId !== 'default') {
        await ensureDb(env.CS_DB);
        const linkCheck = await env.CS_DB.prepare("SELECT is_active FROM links WHERE link_id = ?").bind(linkId).first();
        if (!linkCheck || linkCheck.is_active === 0) return jsonRes({ error: "Access Denied" }, 403);
        
        if (file === "repo") {
          ctx.waitUntil(trackClick(env.CS_DB, linkId, request));
        }
      }

      if (file === "repo") {
        const repoUrl = linkId === 'default' 
            ? `${url.origin}/${mode}/plugins.json` 
            : `${url.origin}/${linkId}/${mode}/plugins.json`;

        return jsonRes({
          name: `CS Bundle - ${mode === 'sfw' ? 'Standard' : 'Adult'}`,
          description: `Automatically updated extension bundle.`,
          manifestVersion: 1,
          pluginLists: [repoUrl]
        });
      }

      if (file === "plugins") {
        const cacheKey = `repo_${linkId}_${mode}`;
        const cached = await env.CS_KV.get(cacheKey);
        if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", ...CORS } });

        const allExt = await getExtensions();
        
        const finalExt = allExt.filter(p => {
          const isAdult = Array.isArray(p.tvTypes) && p.tvTypes.some(t => t.toUpperCase() === "NSFW");
          if (mode === "sfw" && isAdult) return false;
          if (mode === "nsfw" && !isAdult) return false;
          return true;
        });

        const resData = JSON.stringify(finalExt);
        await env.CS_KV.put(cacheKey, resData, { expirationTtl: 300 });
        return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }
    }

    if (!path.startsWith('/api/') && !path.endsWith('.json')) {
      return new Response(uiHTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return jsonRes({ error: "Page not found" }, 404);
  }
};
