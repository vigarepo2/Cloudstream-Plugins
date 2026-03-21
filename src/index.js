import { CORS, jsonResponse } from "./utils.js";
import { hashPass, genToken, genOTP, createRawMimeEmail } from "./auth.js";
import { getAggregatedPlugins } from "./aggregator.js";
import { uiTemplate } from "./html.js";
import { EmailMessage } from "cloudflare:email";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === "OPTIONS") return new Response(null, { headers: CORS });
    
    const mailBinding = env.EMAIL || env.send_email || env.SEND_EMAIL;

    // 1. SETUP DB
    if (path === "/setup") {
      try {
        await env.CS_DB.batch([
          env.CS_DB.prepare(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, password TEXT, token TEXT UNIQUE, verified INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
          env.CS_DB.prepare(`CREATE TABLE IF NOT EXISTS otps (email TEXT PRIMARY KEY, otp TEXT, expires_at INTEGER)`),
          env.CS_DB.prepare(`CREATE TABLE IF NOT EXISTS configs (email TEXT PRIMARY KEY, selected TEXT, sources TEXT, is_public INTEGER DEFAULT 0)`)
        ]);
        return new Response("Aether Vercel-Tier DB Initialized. Return to app.", { headers: CORS });
      } catch(e) { return new Response("Setup Error: " + e.message, { status: 500, headers: CORS }); }
    }

    // 2. NATIVE EMAIL AUTHENTICATION
    if (path === "/api/auth" && method === "POST") {
      try {
        const payload = await request.json();
        if (!payload.email || !payload.password) return jsonResponse({ error: "Email and password required." }, 400);
        
        const email = payload.email.toLowerCase().trim();
        const hash = await hashPass(payload.password);
        const action = payload.action;

        if (action === "signup") {
          if (!mailBinding) return jsonResponse({ error: "Email binding missing in wrangler.toml" }, 500);

          const existing = await env.CS_DB.prepare("SELECT verified FROM users WHERE email = ?").bind(email).first();
          if (existing && existing.verified === 1) return jsonResponse({ error: "Email already registered." }, 400);
          
          const otp = genOTP();
          const expiresAt = Date.now() + (30 * 60 * 1000); 
          
          await env.CS_DB.batch([
            env.CS_DB.prepare("INSERT OR REPLACE INTO users (email, password, token, verified) VALUES (?, ?, ?, 0)").bind(email, hash, genToken()),
            env.CS_DB.prepare("INSERT OR REPLACE INTO otps (email, otp, expires_at) VALUES (?, ?, ?)").bind(email, otp, expiresAt)
          ]);
          
          try {
            const senderEmail = "otp@cloudstream.verify.vs8.in"; 
            const subject = "Your Aether Studio Verification Code";
            const body = `Your secure OTP is: ${otp}\n\nThis code expires in 30 minutes.`;
            const rawMime = createRawMimeEmail(senderEmail, email, subject, body);
            
            const msg = new EmailMessage(senderEmail, email, rawMime);
            await mailBinding.send(msg);
          } catch(mailErr) {
            return jsonResponse({ error: "Email sending failed. " + mailErr.message }, 500);
          }
          
          return jsonResponse({ success: true, message: "OTP sent" });
        }

        if (action === "verify") {
          if (!payload.otp) return jsonResponse({ error: "OTP is required." }, 400);
          
          const record = await env.CS_DB.prepare("SELECT otp, expires_at FROM otps WHERE email = ?").bind(email).first();
          if (!record) return jsonResponse({ error: "No OTP request found." }, 400);
          if (Date.now() > record.expires_at) return jsonResponse({ error: "OTP expired." }, 400);
          if (record.otp !== payload.otp.trim()) return jsonResponse({ error: "Invalid OTP." }, 400);

          const t = genToken();
          await env.CS_DB.batch([
            env.CS_DB.prepare("UPDATE users SET verified = 1, token = ? WHERE email = ?").bind(t, email),
            env.CS_DB.prepare("INSERT OR IGNORE INTO configs (email, selected, sources) VALUES (?, '[]', '[]')").bind(email),
            env.CS_DB.prepare("DELETE FROM otps WHERE email = ?").bind(email)
          ]);
          return jsonResponse({ token: t });
        }

        if (action === "login") {
          const u = await env.CS_DB.prepare("SELECT token, verified FROM users WHERE email = ? AND password = ?").bind(email, hash).first();
          if (!u) return jsonResponse({ error: "Invalid credentials." }, 401);
          if (u.verified === 0) return jsonResponse({ error: "Account not verified." }, 403);
          return jsonResponse({ token: u.token });
        }
      } catch (e) {
        return jsonResponse({ error: "Server error: " + e.message }, 500);
      }
    }

    const reqToken = request.headers.get("Authorization");
    const getUser = async () => {
      if (!reqToken) return null;
      return await env.CS_DB.prepare("SELECT email, token FROM users WHERE token = ?").bind(reqToken).first();
    };

    // 3. REAL-TIME DATA API
    if (path === "/api/me" && method === "GET") {
      const u = await getUser();
      if (!u) return jsonResponse({error:"Unauthorized"}, 401);
      const conf = await env.CS_DB.prepare("SELECT selected, sources, is_public FROM configs WHERE email = ?").bind(u.email).first();
      return jsonResponse({
        user: { email: u.email, token: u.token },
        config: { selected: JSON.parse(conf.selected || '[]'), sources: JSON.parse(conf.sources || '[]'), is_public: conf.is_public === 1 }
      });
    }

    if (path === "/api/me/sync" && method === "POST") {
      const u = await getUser();
      if (!u) return jsonResponse({error:"Unauthorized"}, 401);
      const { selected, sources, is_public } = await request.json();
      
      await env.CS_DB.prepare("UPDATE configs SET selected = ?, sources = ?, is_public = ? WHERE email = ?")
        .bind(JSON.stringify(selected), JSON.stringify(sources), is_public ? 1 : 0, u.email).run();
      
      await env.CS_KV.delete(`repo_${u.token}_sfw`);
      await env.CS_KV.delete(`repo_${u.token}_nsfw`);
      return jsonResponse({ success: true });
    }

    if (path === "/api/explore" && method === "GET") {
      const u = await getUser();
      if (!u) return jsonResponse({error:"Unauthorized"}, 401);
      const conf = await env.CS_DB.prepare("SELECT sources FROM configs WHERE email = ?").bind(u.email).first();
      let customUrls = [];
      try { customUrls = JSON.parse(conf.sources); } catch(e){}
      const plugins = await getAggregatedPlugins(customUrls);
      return jsonResponse(plugins);
    }

    // 4. CLOUDSTREAM REPO ENDPOINTS
    const csMatch = path.match(/^\/([a-zA-Z0-9_]+)\/(sfw|nsfw)\/(repo|plugins)\.json$/);
    if (csMatch && method === "GET") {
      const token = csMatch[1];
      const mode = csMatch[2];
      const file = csMatch[3];

      const u = await env.CS_DB.prepare("SELECT email FROM users WHERE token = ?").bind(token).first();
      if (!u) return jsonResponse({ error: "Invalid Repository Token" }, 404);

      if (file === "repo") {
        return jsonResponse({
          name: `Aether Network [${mode.toUpperCase()}]`,
          description: `High-Performance Vercel-Tier Repository.`,
          manifestVersion: 1,
          pluginLists: [`${new URL(request.url).origin}/${token}/${mode}/plugins.json`]
        });
      }

      if (file === "plugins") {
        const cacheKey = `repo_${token}_${mode}`;
        const cached = await env.CS_KV.get(cacheKey);
        if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", ...CORS } });

        const conf = await env.CS_DB.prepare("SELECT selected, sources FROM configs WHERE email = ?").bind(u.email).first();
        const selected = new Set(JSON.parse(conf.selected || '[]'));
        const customUrls = JSON.parse(conf.sources || '[]');
        const allPlugins = await getAggregatedPlugins(customUrls);
        
        const filtered = allPlugins.filter(p => {
          if (!selected.has(p.internalName)) return false;
          const isNSFW = Array.isArray(p.tvTypes) && p.tvTypes.some(t => t.toUpperCase() === "NSFW");
          if (mode === "sfw" && isNSFW) return false;
          if (mode === "nsfw" && !isNSFW) return false;
          return true;
        });

        const resStr = JSON.stringify(filtered);
        await env.CS_KV.put(cacheKey, resStr, { expirationTtl: 300 });
        return new Response(resStr, { headers: { "Content-Type": "application/json", ...CORS } });
      }
    }

    // 5. VERCEL-STYLE MINIMALIST FRONTEND
    if (path === "/" || path === "") {
      return new Response(uiTemplate, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return jsonResponse({ error: "Not Found" }, 404);
  }
};
