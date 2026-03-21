// Changes: improved email validation (allow all domains), better error handling

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

    if (path === "/api/auth" && method === "POST") {
      try {
        const payload = await request.json();

        if (!payload.email || !payload.password)
          return jsonResponse({ error: "Email and password required." }, 400);

        const email = payload.email.toLowerCase().trim();

        // ✅ FIX: allow ALL domains (not gmail-only)
        if (!isValidEmail(email))
          return jsonResponse({ error: "Invalid email format." }, 400);

        const hash = await hashPass(payload.password);
        const action = payload.action;

        if (action === "signup") {
          const existing = await env.CS_DB.prepare(
            "SELECT verified FROM users WHERE email = ?"
          ).bind(email).first();

          if (existing && existing.verified === 1)
            return jsonResponse({ error: "Email already registered." }, 400);

          const otp = genOTP();
          const expiresAt = Date.now() + 30 * 60 * 1000;

          await env.CS_DB.batch([
            env.CS_DB.prepare(
              "INSERT OR REPLACE INTO users (email, password, token, verified) VALUES (?, ?, ?, 0)"
            ).bind(email, hash, genToken()),

            env.CS_DB.prepare(
              "INSERT OR REPLACE INTO otps (email, otp, expires_at) VALUES (?, ?, ?)"
            ).bind(email, otp, expiresAt),
          ]);

          if (!mailBinding)
            return jsonResponse({ error: "Email service not configured" }, 500);

          const raw = createRawMimeEmail(
            "no-reply@aether.app",
            email,
            "Your OTP Code",
            `Your OTP is: ${otp}`
          );

          await mailBinding.send(new EmailMessage("no-reply@aether.app", email, raw));

          return jsonResponse({ success: true });
        }

        if (action === "login") {
          const u = await env.CS_DB.prepare(
            "SELECT token, verified FROM users WHERE email = ? AND password = ?"
          ).bind(email, hash).first();

          if (!u) return jsonResponse({ error: "Invalid credentials" }, 401);
          if (!u.verified) return jsonResponse({ error: "Verify your email" }, 403);

          return jsonResponse({ token: u.token });
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
