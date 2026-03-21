// FIXED: restored FULL auth (signup + verify + login) + allow all domains

import { CORS, jsonResponse } from "./utils.js";
import { hashPass, genToken, genOTP, createRawMimeEmail } from "./auth.js";
import { getAggregatedPlugins } from "./aggregator.js";
import { uiTemplate } from "./html.js";
import { EmailMessage } from "cloudflare:email";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === "OPTIONS") return new Response(null, { headers: CORS });

    const mailBinding = env.EMAIL;

    // AUTH
    if (path === "/api/auth" && method === "POST") {
      try {
        const { email, password, action, otp } = await request.json();

        if (!email || !password)
          return jsonResponse({ error: "Email & password required" }, 400);

        const cleanEmail = email.toLowerCase().trim();

        if (!isValidEmail(cleanEmail))
          return jsonResponse({ error: "Invalid email format" }, 400);

        const hash = await hashPass(password);

        // SIGNUP
        if (action === "signup") {
          const existing = await env.CS_DB.prepare(
            "SELECT verified FROM users WHERE email = ?"
          ).bind(cleanEmail).first();

          if (existing && existing.verified === 1)
            return jsonResponse({ error: "Already registered" }, 400);

          const code = genOTP();
          const expires = Date.now() + 30 * 60 * 1000;

          await env.CS_DB.batch([
            env.CS_DB.prepare(
              "INSERT OR REPLACE INTO users (email,password,token,verified) VALUES (?,?,?,0)"
            ).bind(cleanEmail, hash, genToken()),

            env.CS_DB.prepare(
              "INSERT OR REPLACE INTO otps (email,otp,expires_at) VALUES (?,?,?)"
            ).bind(cleanEmail, code, expires),
          ]);

          if (!mailBinding)
            return jsonResponse({ error: "Email service missing" }, 500);

          const raw = createRawMimeEmail(
            "otp@cloudstream.verify.vs8.in",
            cleanEmail,
            "Verification Code",
            `Your OTP: ${code}`
          );

          await mailBinding.send(new EmailMessage("otp@cloudstream.verify.vs8.in", cleanEmail, raw));

          return jsonResponse({ success: true, step: "verify" });
        }

        // VERIFY
        if (action === "verify") {
          if (!otp) return jsonResponse({ error: "OTP required" }, 400);

          const record = await env.CS_DB.prepare(
            "SELECT otp,expires_at FROM otps WHERE email=?"
          ).bind(cleanEmail).first();

          if (!record) return jsonResponse({ error: "No OTP" }, 400);
          if (Date.now() > record.expires_at)
            return jsonResponse({ error: "OTP expired" }, 400);
          if (record.otp !== otp)
            return jsonResponse({ error: "Invalid OTP" }, 400);

          const token = genToken();

          await env.CS_DB.batch([
            env.CS_DB.prepare(
              "UPDATE users SET verified=1, token=? WHERE email=?"
            ).bind(token, cleanEmail),

            env.CS_DB.prepare(
              "INSERT OR IGNORE INTO configs (email,selected,sources) VALUES (?, '[]','[]')"
            ).bind(cleanEmail),

            env.CS_DB.prepare("DELETE FROM otps WHERE email=?").bind(cleanEmail),
          ]);

          return jsonResponse({ token });
        }

        // LOGIN
        if (action === "login") {
          const user = await env.CS_DB.prepare(
            "SELECT token,verified FROM users WHERE email=? AND password=?"
          ).bind(cleanEmail, hash).first();

          if (!user) return jsonResponse({ error: "Invalid credentials" }, 401);
          if (!user.verified)
            return jsonResponse({ error: "Verify email first" }, 403);

          return jsonResponse({ token: user.token });
        }
      } catch (e) {
        return jsonResponse({ error: e.message }, 500);
      }
    }

    if (path === "/") {
      return new Response(uiTemplate, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return jsonResponse({ error: "Not Found" }, 404);
  },
};
