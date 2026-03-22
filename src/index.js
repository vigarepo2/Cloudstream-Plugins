import { setupDatabase, hashData, generateId, getUser, getUserByToken } from "./db.js";
import { getCache, setCache, clearUserCaches } from "./kv.js";
import { getBundledExtensions } from "./extensions.js";
import { uiHTML } from "./frontend.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const token = request.headers.get("Authorization");

    try {
      // API: Auth
      if (path === "/api/auth" && method === "POST") {
          await setupDatabase(env.CS_DB); 
          const body = await request.json();
          const username = body.username?.trim().toLowerCase();
          if (!username || !body.password) return json({ error: "Missing required fields" }, 400);
          
          const hash = await hashData(body.password);

          if (body.action === "signup") {
            const exists = await getUser(env.CS_DB, username);
            if (exists) return json({ error: "Username already taken" }, 400);
            
            const session = generateId(32); // Stronger session ID
            await env.CS_DB.batch([
              env.CS_DB.prepare("INSERT INTO accounts (username, password, session_token) VALUES (?, ?, ?)").bind(username, hash, session),
              env.CS_DB.prepare("INSERT INTO user_configs (username) VALUES (?)").bind(username)
            ]);
            return json({ token: session, username });
          }

          if (body.action === "login") {
            const user = await getUser(env.CS_DB, username);
            if (!user) return json({ error: "User not found" }, 401);
            if (user.password !== hash) return json({ error: "Invalid credentials" }, 401);
            return json({ token: user.session_token, username });
          }
      }

      // API: Update Credentials
      if (path === "/api/me/credentials" && method === "PUT") {
          if (!token) return json({ error: "Unauthorized access" }, 401);
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
              if (exists) return json({ error: "Username already taken" }, 400);
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

      // API: Get Data (Selected & Sources)
      if (path === "/api/me" && method === "GET") {
          if (!token) return json({ error: "Unauthorized" }, 401);
          await setupDatabase(env.CS_DB);
          const user = await getUserByToken(env.CS_DB, token);
          if (!user) return json({ error: "Invalid session" }, 401);

          const config = await env.CS_DB.prepare("SELECT selected, custom_sources FROM user_configs WHERE username = ?").bind(user.username).first();
          return json({
              selected: JSON.parse(config?.selected || '[]'),
              sources: JSON.parse(config?.custom_sources || '[]')
          });
      }

      // API: Save Selections
      if (path === "/api/me/plugins" && method === "POST") {
          if (!token) return json({ error: "Unauthorized" }, 401);
          await setupDatabase(env.CS_DB);
          const user = await getUserByToken(env.CS_DB, token);
          if (!user) return json({ error: "Invalid session" }, 401);

          const body = await request.json();
          if(!Array.isArray(body.selected) || !Array.isArray(body.sources)) return json({ error: "Invalid payload format" }, 400);

          await env.CS_DB.prepare("UPDATE user_configs SET selected = ?, custom_sources = ? WHERE username = ?")
              .bind(JSON.stringify(body.selected), JSON.stringify(body.sources), user.username).run();

          await clearUserCaches(env.CS_KV, user.username);
          return json({ success: true });
      }

      // API: Get Plugins
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
          const resData = JSON.stringify(data);
          await setCache(env.CS_KV, cacheKey, resData, 604800);
          return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }
      
      // API: Refresh Plugins
      if (path === "/api/plugins/refresh" && method === "POST") {
          if (!token) return json({ error: "Unauthorized" }, 401);
          await setupDatabase(env.CS_DB);
          const user = await getUserByToken(env.CS_DB, token);
          if (!user) return json({ error: "Invalid session" }, 401);

          const config = await env.CS_DB.prepare("SELECT custom_sources FROM user_configs WHERE username = ?").bind(user.username).first();
          const customUrls = JSON.parse(config?.custom_sources || '[]');
          
          await clearUserCaches(env.CS_KV, user.username);

          const data = await getBundledExtensions(customUrls);
          const resData = JSON.stringify(data);
          await setCache(env.CS_KV, `user_plugins_${user.username}`, resData, 604800);
          return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }

      // MAGIC REPOSITORY GENERATOR
      const repoMatch = path.match(/^\/([a-zA-Z0-9_-]+)\/(all|sfw|nsfw)\/(repo|plugins)\.json$/);
      if (repoMatch && method === "GET") {
        let reqUsername = repoMatch[1];
        let mode = repoMatch[2];
        let file = repoMatch[3];

        await setupDatabase(env.CS_DB);
        const userCheck = await env.CS_DB.prepare("SELECT username FROM accounts WHERE username = ?").bind(reqUsername).first();
        if (!userCheck) return json({ error: "Repository Not Found" }, 404);

        let libraryName = 'Full Bundle (Mixed)';
        if (mode === 'sfw') libraryName = 'Safe Content';
        if (mode === 'nsfw') libraryName = 'Adult Content (18+)';

        if (file === "repo") {
          return json({
            name: `My CS - ${libraryName}`,
            description: `Personal synchronized repository.`,
            manifestVersion: 1,
            pluginLists: [`${url.origin}/${reqUsername}/${mode}/plugins.json`]
          });
        }

        if (file === "plugins") {
          const cacheKey = `repo_${reqUsername}_${mode}`;
          const cached = await getCache(env.CS_KV, cacheKey);
          if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", ...CORS } });

          const config = await env.CS_DB.prepare("SELECT selected, custom_sources FROM user_configs WHERE username = ?").bind(reqUsername).first();
          const selectedSet = new Set(JSON.parse(config?.selected || '[]'));
          const customUrls = JSON.parse(config?.custom_sources || '[]');
          
          const globalCacheKey = `user_plugins_${reqUsername}`;
          let allExt;
          const globalCached = await getCache(env.CS_KV, globalCacheKey);
          if(globalCached) {
              allExt = JSON.parse(globalCached);
          } else {
              allExt = await getBundledExtensions(customUrls);
              await setCache(env.CS_KV, globalCacheKey, JSON.stringify(allExt), 604800);
          }
          
          const finalExt = allExt.filter(p => {
            if (!selectedSet.has(p.internalName)) return false; 
            if (mode === "sfw" && p.isAdult) return false;
            if (mode === "nsfw" && !p.isAdult) return false;
            return true;
          });

          const resData = JSON.stringify(finalExt);
          await setCache(env.CS_KV, cacheKey, resData, 86400); // 1 day cache
          return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
        }
      }

      // Serve HTML Frontend
      if (!path.startsWith('/api/') && !path.endsWith('.json')) {
        return new Response(uiHTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }

      return json({ error: "Endpoint not found" }, 404);

    } catch (error) {
      console.error("Global Error Handler:", error);
      return json({ error: "Internal Server Error", message: error.message }, 500);
    }
  }
};
