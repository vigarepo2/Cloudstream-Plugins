import { setupDatabase, hashData, generateId, getUser, getUserByToken } from "./db.js";
import { getCache, setCache, clearUserCaches } from "./kv.js";
import { uiHTML } from "./frontend.js";

const BASE_PLUGINS_URL = "https://raw.githubusercontent.com/vigarepo2/Cloudstream-Plugins/refs/heads/main/plugins.json";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json", ...CORS } });
}

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) return 'N/A';
  const k = 1024, sizes = ['B', 'KB', 'MB'], i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function fetchSource(url, depth = 0) {
  if (depth > 2) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 
  try {
    const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true }, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let coll = [];
    if (Array.isArray(data)) coll = data;
    else {
      if (data.plugins && Array.isArray(data.plugins)) coll = coll.concat(data.plugins);
      if (data.pluginLists && Array.isArray(data.pluginLists)) {
        const sub = await Promise.allSettled(data.pluginLists.map(u => fetchSource(u, depth + 1)));
        sub.forEach(result => { if(result.status === 'fulfilled') coll = coll.concat(result.value); });
      }
    }
    return coll;
  } catch (err) {
    clearTimeout(timeoutId);
    return []; 
  }
}

async function getBundledExtensions(customUrls = []) {
  const allUrls = [BASE_PLUGINS_URL, ...new Set(customUrls || [])];
  const results = await Promise.allSettled(allUrls.map(url => fetchSource(url)));
  const rawList = results.filter(r => r.status === 'fulfilled').map(r => r.value).flat();
  
  const processed = [], namesMap = new Map();

  for (const item of rawList) {
    if (!item || typeof item !== 'object' || !item.name) continue;
    
    let baseName = item.name;
    if (namesMap.has(baseName)) {
      const count = namesMap.get(baseName) + 1;
      namesMap.set(baseName, count);
      item.name = `${baseName} (${count})`;
      item.internalName = `${item.internalName || baseName.replace(/\s+/g, '')}_${count}`;
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
    item.isBroken = item.status === 0;
    
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

    try {
      if (path === "/api/auth" && method === "POST") {
          await setupDatabase(env.CS_DB); 
          const body = await request.json();
          const username = body.username?.trim().toLowerCase();
          if (!username || !body.password) return json({ error: "Missing required fields" }, 400);
          
          const hash = await hashData(body.password);

          if (body.action === "signup") {
            const exists = await getUser(env.CS_DB, username);
            if (exists) return json({ error: "Username already taken" }, 400);
            
            const session = generateId(32);
            await env.CS_DB.batch([
              env.CS_DB.prepare("INSERT INTO accounts (username, password, session_token) VALUES (?, ?, ?)").bind(username, hash, session),
              env.CS_DB.prepare("INSERT INTO user_configs (username) VALUES (?)").bind(username)
            ]);
            return json({ token: session, username });
          }

          if (body.action === "login") {
            const user = await getUser(env.CS_DB, username);
            if (!user || user.password !== hash) return json({ error: "Invalid credentials" }, 401);
            return json({ token: user.session_token, username });
          }
      }

      if (path === "/api/me/credentials" && method === "PUT") {
          if (!token) return json({ error: "Unauthorized" }, 401);
          await setupDatabase(env.CS_DB);
          const user = await env.CS_DB.prepare("SELECT username, password FROM accounts WHERE session_token = ?").bind(token).first();
          if (!user) return json({ error: "Invalid session" }, 401);

          const body = await request.json();
          const newUsername = body.username?.trim().toLowerCase();
          const newPassword = body.password;

          if (!newUsername && !newPassword) return json({ error: "No changes provided" }, 400);

          let finalUsername = user.username;
          let finalPassword = user.password;

          if (newUsername && newUsername !== user.username) {
              const exists = await env.CS_DB.prepare("SELECT username FROM accounts WHERE username = ?").bind(newUsername).first();
              if (exists) return json({ error: "Username taken" }, 400);
              finalUsername = newUsername;
          }
          if (newPassword) finalPassword = await hashData(newPassword);

          await env.CS_DB.batch([
              env.CS_DB.prepare("UPDATE accounts SET username = ?, password = ? WHERE session_token = ?").bind(finalUsername, finalPassword, token),
              env.CS_DB.prepare("UPDATE user_configs SET username = ? WHERE username = ?").bind(finalUsername, user.username)
          ]);
          await clearUserCaches(env.CS_KV, user.username);
          return json({ success: true, username: finalUsername });
      }

      if (path === "/api/me" && method === "GET") {
          if (!token) return json({ error: "Unauthorized" }, 401);
          await setupDatabase(env.CS_DB);
          const user = await getUserByToken(env.CS_DB, token);
          if (!user) return json({ error: "Invalid session" }, 401);

          const config = await env.CS_DB.prepare("SELECT selected, custom_sources FROM user_configs WHERE username = ?").bind(user.username).first();
          return json({ selected: JSON.parse(config?.selected || '[]'), sources: JSON.parse(config?.custom_sources || '[]') });
      }

      if (path === "/api/me/plugins" && method === "POST") {
          if (!token) return json({ error: "Unauthorized" }, 401);
          await setupDatabase(env.CS_DB);
          const user = await getUserByToken(env.CS_DB, token);
          if (!user) return json({ error: "Invalid session" }, 401);

          const body = await request.json();
          await env.CS_DB.prepare("UPDATE user_configs SET selected = ?, custom_sources = ? WHERE username = ?")
              .bind(JSON.stringify(body.selected), JSON.stringify(body.sources), user.username).run();

          await clearUserCaches(env.CS_KV, user.username);
          return json({ success: true });
      }

      if (path === "/api/plugins" && method === "GET") {
          if (!token) return json({ error: "Unauthorized" }, 401);
          await setupDatabase(env.CS_DB);
          const user = await getUserByToken(env.CS_DB, token);
          if (!user) return json({ error: "Invalid session" }, 401);

          const config = await env.CS_DB.prepare("SELECT custom_sources FROM user_configs WHERE username = ?").bind(user.username).first();
          const customUrls = JSON.parse(config?.custom_sources || '[]');
          
          const cacheKey = `user_plugins_${user.username}`;
          const cached = await getCache(env.CS_KV, cacheKey);
          if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", ...CORS } });

          const data = await getBundledExtensions(customUrls);
          const resData = JSON.stringify(data, null, 2);
          await setCache(env.CS_KV, cacheKey, resData, 604800);
          return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }
      
      if (path === "/api/plugins/refresh" && method === "POST") {
          if (!token) return json({ error: "Unauthorized" }, 401);
          await setupDatabase(env.CS_DB);
          const user = await getUserByToken(env.CS_DB, token);
          if (!user) return json({ error: "Invalid session" }, 401);

          const config = await env.CS_DB.prepare("SELECT custom_sources FROM user_configs WHERE username = ?").bind(user.username).first();
          const customUrls = JSON.parse(config?.custom_sources || '[]');
          
          await clearUserCaches(env.CS_KV, user.username);
          const data = await getBundledExtensions(customUrls);
          const resData = JSON.stringify(data, null, 2);
          await setCache(env.CS_KV, `user_plugins_${user.username}`, resData, 604800);
          return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }

      const repoMatch = path.match(/^\/([a-zA-Z0-9_-]+)\/(all|sfw|nsfw)\/(repo|plugins)\.json$/);
      if (repoMatch && method === "GET") {
        let reqUsername = repoMatch[1], mode = repoMatch[2], file = repoMatch[3];

        await setupDatabase(env.CS_DB);
        const userCheck = await env.CS_DB.prepare("SELECT username FROM accounts WHERE username = ?").bind(reqUsername).first();
        if (!userCheck) return json({ error: "Repository Not Found" }, 404);

        if (file === "repo") {
          const libraryName = mode === 'sfw' ? 'Safe Content' : mode === 'nsfw' ? 'Adult Content (18+)' : 'Full Bundle';
          return json({ name: `CloudStream - ${libraryName}`, description: `Personal synchronized repository.`, manifestVersion: 1, pluginLists: [`${url.origin}/${reqUsername}/${mode}/plugins.json`] });
        }

        if (file === "plugins") {
          const cacheKey = `repo_${reqUsername}_${mode}`;
          const cached = await getCache(env.CS_KV, cacheKey);
          if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });

          const config = await env.CS_DB.prepare("SELECT selected, custom_sources FROM user_configs WHERE username = ?").bind(reqUsername).first();
          const selectedSet = new Set(JSON.parse(config?.selected || '[]'));
          const customUrls = JSON.parse(config?.custom_sources || '[]');
          
          const globalCacheKey = `user_plugins_${reqUsername}`;
          let allExt;
          const globalCached = await getCache(env.CS_KV, globalCacheKey);
          if(globalCached) { allExt = JSON.parse(globalCached); } 
          else { allExt = await getBundledExtensions(customUrls); await setCache(env.CS_KV, globalCacheKey, JSON.stringify(allExt, null, 2), 604800); }
          
          const finalExt = allExt.filter(p => {
            if (!selectedSet.has(p.internalName)) return false; 
            if (mode === "sfw" && p.isAdult) return false;
            if (mode === "nsfw" && !p.isAdult) return false;
            return true;
          });

          const resData = JSON.stringify(finalExt, null, 2);
          await setCache(env.CS_KV, cacheKey, resData, 86400);
          return new Response(resData, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }
      }

      if (!path.startsWith('/api/') && !path.endsWith('.json')) {
        return new Response(uiHTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }

      return json({ error: "Endpoint not found" }, 404);

    } catch (error) {
      return json({ error: "Internal Server Error" }, 500);
    }
  }
};
