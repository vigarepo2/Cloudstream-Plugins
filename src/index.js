import { setupDatabase, registerUser, loginUser, getUserByToken, getUserSettings, updateUserSettings, cleanUsername } from "./db.js";
import { getExtensions } from "./extensions.js";
import { uiHTML } from "./frontend.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const token = request.headers.get("Authorization");

    if (path === "/setup") {
      try {
        await setupDatabase(env.CS_DB);
        return jsonRes({ success: true, message: "Database ready" });
      } catch (e) {
        return jsonRes({ error: "Setup failed" }, 500);
      }
    }

    if (path === "/api/auth" && method === "POST") {
      try {
        const body = await request.json();
        const username = cleanUsername(body.username);
        
        if (!username || !body.password) return jsonRes({ error: "Username and password required" }, 400);

        if (body.action === "signup") {
          const exists = await env.CS_DB.prepare("SELECT username FROM users WHERE username = ?").bind(username).first();
          if (exists) return jsonRes({ error: "Username taken" }, 400);
          const newToken = await registerUser(env.CS_DB, username, body.password);
          return jsonRes({ token: newToken, username });
        }

        if (body.action === "login") {
          const userToken = await loginUser(env.CS_DB, username, body.password);
          if (!userToken) return jsonRes({ error: "Wrong username or password" }, 401);
          return jsonRes({ token: userToken, username });
        }
      } catch (e) { return jsonRes({ error: "Auth error" }, 500); }
    }

    if (path === "/api/user" && method === "GET") {
      const user = await getUserByToken(env.CS_DB, token);
      if (!user) return jsonRes({ error: "Not logged in" }, 401);
      const settings = await getUserSettings(env.CS_DB, user.username);
      return jsonRes({
        username: user.username,
        token: user.token,
        selected: JSON.parse(settings.selected || '[]'),
        sources: JSON.parse(settings.sources || '[]'),
        isPublic: settings.is_public === 1
      });
    }

    if (path === "/api/user" && method === "POST") {
      const user = await getUserByToken(env.CS_DB, token);
      if (!user) return jsonRes({ error: "Not logged in" }, 401);
      const body = await request.json();
      await updateUserSettings(env.CS_DB, user.username, body.selected, body.sources, body.isPublic);
      await env.CS_KV.delete(`app_${user.token}_safe`);
      await env.CS_KV.delete(`app_${user.token}_18plus`);
      return jsonRes({ success: true });
    }

    if (path === "/api/extensions" && method === "GET") {
      const user = await getUserByToken(env.CS_DB, token);
      if (!user) return jsonRes({ error: "Not logged in" }, 401);
      const settings = await getUserSettings(env.CS_DB, user.username);
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

        const settings = await getUserSettings(env.CS_DB, user.username);
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
