import { uiHTML } from "./frontend.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

function generateToken() {
  return crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
}

function cleanUsername(username) {
  if (!username) return "";
  return username.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function ensureDb(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT, token TEXT UNIQUE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS settings (username TEXT PRIMARY KEY, selected TEXT DEFAULT '[]', sources TEXT DEFAULT '[]', is_public INTEGER DEFAULT 0)`)
  ]);
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

async function getExtensions(customUrls = []) {
  const allUrls = [...DEFAULT_SOURCES, ...customUrls];
  const promises = allUrls.map(url => fetchSource(url));
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
      item.name = `${item.name} (${count})`;
    } else {
      names.set(key, 1);
      item.internalName = key;
    }
    if (typeof item.type === 'string' && !item.tvTypes) item.tvTypes = item.type.split(',').map(s => s.trim().toUpperCase());
    else if (!item.tvTypes) item.tvTypes = ["VOD"];
    processed.push(item);
  }
  return processed.sort((a, b) => a.name.localeCompare(b.name));
}

export default {
  async fetch(request, env) {
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
          const newToken = generateToken();
          await env.CS_DB.batch([
            env.CS_DB.prepare("INSERT INTO users (username, password, token) VALUES (?, ?, ?)").bind(username, hash, newToken),
            env.CS_DB.prepare("INSERT INTO settings (username) VALUES (?)").bind(username)
          ]);
          return jsonRes({ token: newToken, username });
        }

        if (body.action === "login") {
          const user = await env.CS_DB.prepare("SELECT token FROM users WHERE username = ? AND password = ?").bind(username, hash).first();
          if (!user) return jsonRes({ error: "Incorrect username or password" }, 401);
          return jsonRes({ token: user.token, username });
        }
      } catch (e) { return jsonRes({ error: "System error: " + e.message }, 500); }
    }

    if (path === "/api/user" && method === "GET") {
      if (!token) return jsonRes({ error: "Please log in" }, 401);
      const user = await env.CS_DB.prepare("SELECT username, token FROM users WHERE token = ?").bind(token).first();
      if (!user) return jsonRes({ error: "Please log in" }, 401);
      const settings = await env.CS_DB.prepare("SELECT selected, sources, is_public FROM settings WHERE username = ?").bind(user.username).first();
      return jsonRes({
        username: user.username,
        token: user.token,
        selected: JSON.parse(settings.selected || '[]'),
        sources: JSON.parse(settings.sources || '[]'),
        isPublic: settings.is_public === 1
      });
    }

    if (path === "/api/user" && method === "POST") {
      if (!token) return jsonRes({ error: "Please log in" }, 401);
      const user = await env.CS_DB.prepare("SELECT username, token FROM users WHERE token = ?").bind(token).first();
      if (!user) return jsonRes({ error: "Please log in" }, 401);
      const body = await request.json();
      await env.CS_DB.prepare("UPDATE settings SET selected = ?, sources = ?, is_public = ? WHERE username = ?")
        .bind(JSON.stringify(body.selected), JSON.stringify(body.sources), body.isPublic ? 1 : 0, user.username).run();
      await env.CS_KV.delete(`app_${user.token}_safe`);
      await env.CS_KV.delete(`app_${user.token}_18plus`);
      return jsonRes({ success: true });
    }

    if (path === "/api/extensions" && method === "GET") {
      if (!token) return jsonRes({ error: "Please log in" }, 401);
      const user = await env.CS_DB.prepare("SELECT username FROM users WHERE token = ?").bind(token).first();
      if (!user) return jsonRes({ error: "Please log in" }, 401);
      const settings = await env.CS_DB.prepare("SELECT sources FROM settings WHERE username = ?").bind(user.username).first();
      const customUrls = JSON.parse(settings.sources || '[]');
      const data = await getExtensions(customUrls);
      return jsonRes(data);
    }

    const appMatch = path.match(/^\/([a-zA-Z0-9]+)\/(safe|18plus)\/(repo|plugins)\.json$/);
    if (appMatch && method === "GET") {
      const appToken = appMatch[1];
      const mode = appMatch[2];
      const file = appMatch[3];

      const user = await env.CS_DB.prepare("SELECT username FROM users WHERE token = ?").bind(appToken).first();
      if (!user) return jsonRes({ error: "Link not found" }, 404);

      if (file === "repo") {
        return jsonRes({
          name: `My Extensions (${mode === 'safe' ? 'Safe' : '18+'})`,
          description: `Created by ${user.username}`,
          manifestVersion: 1,
          pluginLists: [`${url.origin}/${appToken}/${mode}/plugins.json`]
        });
      }

      if (file === "plugins") {
        const cacheKey = `app_${appToken}_${mode}`;
        const cached = await env.CS_KV.get(cacheKey);
        if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", ...CORS } });

        const settings = await env.CS_DB.prepare("SELECT selected, sources FROM settings WHERE username = ?").bind(user.username).first();
        const selected = new Set(JSON.parse(settings.selected || '[]'));
        const customUrls = JSON.parse(settings.sources || '[]');
        const allExt = await getExtensions(customUrls);
        
        const finalExt = allExt.filter(p => {
          if (!selected.has(p.internalName)) return false;
          const isAdult = Array.isArray(p.tvTypes) && p.tvTypes.some(t => t.toUpperCase() === "NSFW");
          if (mode === "safe" && isAdult) return false;
          if (mode === "18plus" && !isAdult) return false;
          return true;
        });

        const resData = JSON.stringify(finalExt);
        await env.CS_KV.put(cacheKey, resData, { expirationTtl: 300 });
        return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }
    }

    if (path === "/" || path === "") {
      return new Response(uiHTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return jsonRes({ error: "Page not found" }, 404);
  }
};
