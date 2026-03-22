import { Router } from "./core/router.js";
import { DatabaseService } from "./services/database.js";
import { CryptoService } from "./services/crypto.js";
import { AggregatorService } from "./services/aggregator.js";
import { createJsonResponse, createHtmlResponse } from "./utils/response.js";
import { uiTemplate } from "../frontend/template.js";

const app = new Router();

app.get("/", () => createHtmlResponse(uiTemplate));

app.get("/system/initialize", async ({ env }) => {
  const db = new DatabaseService(env.CS_DB);
  await db.initializeSchema();
  return createJsonResponse({ status: "operational", message: "Database structures compiled." });
});

app.post("/api/identity/authenticate", async ({ body, env }) => {
  const { action, username, password } = body;
  const sanitizedUser = CryptoService.sanitizeInput(username);
  
  if (!sanitizedUser || !password) return createJsonResponse({ error: "Malformed payload." }, 400);

  const db = new DatabaseService(env.CS_DB);
  const hash = await CryptoService.hashString(password);

  if (action === "register") {
    const existing = await db.getAccountByUsername(sanitizedUser);
    if (existing) return createJsonResponse({ error: "Identity conflict detected." }, 409);
    
    const token = CryptoService.generateSecureToken();
    await db.createAccount(sanitizedUser, hash, token);
    return createJsonResponse({ token, username: sanitizedUser });
  }

  if (action === "authenticate") {
    const account = await db.getAccountByUsername(sanitizedUser);
    if (!account || account.password_hash !== hash) return createJsonResponse({ error: "Invalid credentials." }, 401);
    return createJsonResponse({ token: account.access_token, username: sanitizedUser });
  }

  return createJsonResponse({ error: "Invalid action directive." }, 400);
});

async function requireAuth(token, env) {
  if (!token) throw new Error("Unauthorized");
  const db = new DatabaseService(env.CS_DB);
  const user = await db.getAccountByToken(token);
  if (!user) throw new Error("Unauthorized");
  return { user, db };
}

app.get("/api/workspace/state", async ({ token, env }) => {
  try {
    const { user, db } = await requireAuth(token, env);
    const config = await db.getConfiguration(user.username);
    return createJsonResponse({
      identity: { username: user.username, token: user.access_token },
      configuration: {
        selected: JSON.parse(config.selected_plugins || '[]'),
        sources: JSON.parse(config.custom_sources || '[]'),
        isPublic: config.is_public === 1
      }
    });
  } catch (e) { return createJsonResponse({ error: "Authentication required" }, 401); }
});

app.post("/api/workspace/sync", async ({ body, token, env }) => {
  try {
    const { user, db } = await requireAuth(token, env);
    const { selected, sources, isPublic } = body;
    
    await db.updateConfiguration(user.username, selected, sources, isPublic);
    await env.CS_KV.delete(`registry_${user.access_token}_sfw`);
    await env.CS_KV.delete(`registry_${user.access_token}_nsfw`);
    
    return createJsonResponse({ status: "synchronized" });
  } catch (e) { return createJsonResponse({ error: "Authentication required" }, 401); }
});

app.get("/api/network/discover", async ({ token, env }) => {
  try {
    const { user, db } = await requireAuth(token, env);
    const config = await db.getConfiguration(user.username);
    const customSources = JSON.parse(config.custom_sources || '[]');
    const networkData = await AggregatorService.compileNetwork(customSources);
    return createJsonResponse(networkData);
  } catch (e) { return createJsonResponse({ error: "Authentication required" }, 401); }
});

app.get("/:token/:mode/:file", async ({ params, env, url }) => {
  const { token, mode, file } = params;
  if (!["sfw", "nsfw"].includes(mode) || !["repo.json", "plugins.json"].includes(file)) {
    return createJsonResponse({ error: "Invalid repository parameters." }, 400);
  }

  const db = new DatabaseService(env.CS_DB);
  const user = await db.getAccountByToken(token);
  
  if (!user) {
    const allConfigsQuery = await env.CS_DB.prepare("SELECT c.username, a.access_token FROM configurations c JOIN accounts a ON c.username = a.username WHERE c.is_public = 1").all();
    const publicUsers = allConfigsQuery.results;
    const isPublic = publicUsers.some(u => u.access_token === token);
    if(!isPublic) return createJsonResponse({ error: "Repository is restricted." }, 403);
  }

  const identity = user ? user.username : "Public Repository";

  if (file === "repo.json") {
    return createJsonResponse({
      name: `Aether Registry [${mode.toUpperCase()}]`,
      description: `Edge architecture maintained by ${identity}`,
      manifestVersion: 1,
      pluginLists: [`${url.origin}/${token}/${mode}/plugins.json`]
    });
  }

  if (file === "plugins.json") {
    const cacheKey = `registry_${token}_${mode}`;
    const cachedData = await env.CS_KV.get(cacheKey);
    
    if (cachedData) {
      return new Response(cachedData, { headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }

    const targetUser = user || await env.CS_DB.prepare("SELECT username FROM accounts WHERE access_token = ?").bind(token).first();
    const config = await db.getConfiguration(targetUser.username);
    
    const selectedSet = new Set(JSON.parse(config.selected_plugins || '[]'));
    const customSources = JSON.parse(config.custom_sources || '[]');
    const fullNetwork = await AggregatorService.compileNetwork(customSources);
    
    const filteredPayload = fullNetwork.filter(plugin => {
      if (!selectedSet.has(plugin.internalName)) return false;
      const isAdult = Array.isArray(plugin.tvTypes) && plugin.tvTypes.some(t => t.toUpperCase() === "NSFW");
      if (mode === "sfw" && isAdult) return false;
      if (mode === "nsfw" && !isAdult) return false;
      return true;
    });

    const stringifiedPayload = JSON.stringify(filteredPayload);
    await env.CS_KV.put(cacheKey, stringifiedPayload, { expirationTtl: 300 });
    
    return new Response(stringifiedPayload, { headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }
});

export default {
  async fetch(request, env) {
    return await app.route(request, env);
  }
};
