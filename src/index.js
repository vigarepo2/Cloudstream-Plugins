import { setupDatabase, hashData, generateId, trackClick, getUser, getUserByToken } from "./db.js";
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
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const token = request.headers.get("Authorization");

    if (path === "/api/auth" && method === "POST") {
      try {
        await setupDatabase(env.CS_DB); 
        const body = await request.json();
        const username = body.username?.trim().toLowerCase();
        if (!username || !body.password) return json({ error: "Missing fields" }, 400);
        
        const hash = await hashData(body.password);

        if (body.action === "signup") {
          const exists = await getUser(env.CS_DB, username);
          if (exists) return json({ error: "Username taken" }, 400);
          
          const session = generateId(24);
          await env.CS_DB.batch([
            env.CS_DB.prepare("INSERT INTO users (username, password, session_token) VALUES (?, ?, ?)").bind(username, hash, session),
            env.CS_DB.prepare("INSERT INTO settings (username) VALUES (?)").bind(username)
          ]);
          return json({ token: session, username });
        }

        if (body.action === "login") {
          const user = await getUser(env.CS_DB, username);
          if (!user) return json({ error: "user_not_found" }, 401);
          if (user.password !== hash) return json({ error: "wrong_password" }, 401);
          return json({ token: user.session_token, username });
        }
      } catch (e) { return json({ error: "System Error" }, 500); }
    }

    if (path === "/api/user/settings") {
        if (!token) return json({ error: "Unauthorized" }, 401);
        const user = await getUserByToken(env.CS_DB, token);
        if (!user) return json({ error: "Unauthorized" }, 401);

        if (method === "GET") {
            const settings = await env.CS_DB.prepare("SELECT selected, custom_sources FROM settings WHERE username = ?").bind(user.username).first();
            return json({ 
                selected: JSON.parse(settings?.selected || '[]'), 
                sources: JSON.parse(settings?.custom_sources || '[]') 
            });
        }
        
        if (method === "POST") {
            const body = await request.json();
            await env.CS_DB.prepare("UPDATE settings SET selected = ?, custom_sources = ? WHERE username = ?")
                .bind(JSON.stringify(body.selected), JSON.stringify(body.sources), user.username).run();
            await clearUserCaches(env.CS_DB, env.CS_KV, user.username);
            return json({ success: true });
        }
    }

    if (path.startsWith("/api/links")) {
        if (!token) return json({ error: "Unauthorized" }, 401);
        const user = await getUserByToken(env.CS_DB, token);
        if (!user) return json({ error: "Unauthorized" }, 401);

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
            return json(results);
        }

        if (method === "POST" && path === "/api/links") {
            const body = await request.json();
            let linkId = body.id ? body.id.toLowerCase().replace(/[^a-z0-9]/g, '') : generateId(10);
            if (linkId.length === 0) linkId = generateId(10);
            
            const exists = await env.CS_DB.prepare("SELECT link_id FROM links WHERE link_id = ?").bind(linkId).first();
            if (exists) return json({ error: "Custom ID already in use" }, 400);

            await env.CS_DB.prepare("INSERT INTO links (link_id, username, name) VALUES (?, ?, ?)").bind(linkId, user.username, body.name).run();
            return json({ success: true, linkId });
        }

        const linkMatch = path.match(/^\/api\/links\/([a-zA-Z0-9]+)$/);
        if (linkMatch) {
            const targetId = linkMatch[1];
            const linkData = await env.CS_DB.prepare("SELECT username FROM links WHERE link_id = ?").bind(targetId).first();
            if(!linkData || linkData.username !== user.username) return json({ error: "Not found" }, 404);

            if (method === "PUT") {
                const body = await request.json();
                await env.CS_DB.prepare("UPDATE links SET is_active = ? WHERE link_id = ?").bind(body.is_active, targetId).run();
                await clearUserCaches(env.CS_DB, env.CS_KV, user.username);
                return json({ success: true });
            }
            if (method === "DELETE") {
                await env.CS_DB.batch([
                    env.CS_DB.prepare("DELETE FROM links WHERE link_id = ?").bind(targetId),
                    env.CS_DB.prepare("DELETE FROM analytics WHERE link_id = ?").bind(targetId)
                ]);
                await clearUserCaches(env.CS_DB, env.CS_KV, user.username);
                return json({ success: true });
            }
        }
    }

    if (path === "/api/extensions" && method === "GET") {
        if (!token) return json({ error: "Unauthorized" }, 401);
        const user = await getUserByToken(env.CS_DB, token);
        const settings = await env.CS_DB.prepare("SELECT custom_sources FROM settings WHERE username = ?").bind(user.username).first();
        const customUrls = JSON.parse(settings?.custom_sources || '[]');
        const data = await getBundledExtensions(customUrls);
        return json(data);
    }

    // MATCHES: /username/sfw/repo.json  OR  /CUSTOM123/sfw/repo.json
    const repoMatch = path.match(/^\/([a-zA-Z0-9_-]+)\/(sfw|nsfw)\/(repo|plugins)\.json$/);
    if (repoMatch && method === "GET") {
      let identifier = repoMatch[1];
      let mode = repoMatch[2];
      let file = repoMatch[3];

      let ownerUsername = null;
      let isResellerLink = false;

      await setupDatabase(env.CS_DB);
      
      // Check if identifier is a direct username (Personal Link)
      const userCheck = await env.CS_DB.prepare("SELECT username FROM users WHERE username = ?").bind(identifier).first();
      if (userCheck) {
          ownerUsername = userCheck.username;
      } else {
          // Check if identifier is a Reseller Link
          const linkCheck = await env.CS_DB.prepare("SELECT username, is_active FROM links WHERE link_id = ?").bind(identifier).first();
          if (!linkCheck || linkCheck.is_active === 0) return json({ error: "Access Denied or Link Disabled" }, 403);
          ownerUsername = linkCheck.username;
          isResellerLink = true;
      }

      if (!ownerUsername) return json({ error: "Repository Not Found" }, 404);

      if (file === "repo") {
        if (isResellerLink) ctx.waitUntil(trackClick(env.CS_DB, identifier, request));

        return json({
          name: `CS Bundle - ${mode === 'sfw' ? 'Standard' : 'Adult 18+'}`,
          description: `Automatically updated extension bundle.`,
          manifestVersion: 1,
          pluginLists: [`${url.origin}/${identifier}/${mode}/plugins.json`]
        });
      }

      if (file === "plugins") {
        const cacheKey = `repo_${identifier}_${mode}`;
        const cached = await getCache(env.CS_KV, cacheKey);
        if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", ...CORS } });

        const settings = await env.CS_DB.prepare("SELECT selected, custom_sources FROM settings WHERE username = ?").bind(ownerUsername).first();
        const selectedSet = new Set(JSON.parse(settings?.selected || '[]'));
        const customUrls = JSON.parse(settings?.custom_sources || '[]');
        
        const allExt = await getBundledExtensions(customUrls);
        
        const finalExt = allExt.filter(p => {
          if (!selectedSet.has(p.internalName)) return false; // Filter by User's Selection
          if (mode === "sfw" && p.isAdult) return false;
          if (mode === "nsfw" && !p.isAdult) return false;
          return true;
        });

        const resData = JSON.stringify(finalExt);
        await setCache(env.CS_KV, cacheKey, resData, 300);
        return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }
    }

    if (!path.startsWith('/api/') && !path.endsWith('.json')) {
      return new Response(uiHTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return json({ error: "Not found" }, 404);
  }
};
