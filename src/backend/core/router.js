import { CORS_HEADERS, createJsonResponse } from "../utils/response.js";

export class Router {
  constructor() {
    this.routes = { GET: [], POST: [], PUT: [], DELETE: [] };
  }

  get(path, handler) { this.routes.GET.push({ path: new RegExp(`^${path.replace(/:\w+/g, '([\\w-]+)')}$`), handler, keys: (path.match(/:\w+/g) || []).map(k => k.substring(1)) }); }
  post(path, handler) { this.routes.POST.push({ path: new RegExp(`^${path.replace(/:\w+/g, '([\\w-]+)')}$`), handler, keys: (path.match(/:\w+/g) || []).map(k => k.substring(1)) }); }

  async route(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

    const url = new URL(request.url);
    const methodRoutes = this.routes[request.method] || [];

    for (const route of methodRoutes) {
      const match = url.pathname.match(route.path);
      if (match) {
        const params = {};
        route.keys.forEach((key, index) => {
          params[key] = match[index + 1];
        });
        
        const reqContext = {
          request,
          url,
          params,
          env,
          body: request.method !== "GET" ? await request.json().catch(() => ({})) : {},
          token: request.headers.get("Authorization")
        };

        try {
          return await route.handler(reqContext);
        } catch (error) {
          return createJsonResponse({ error: "Internal Server Fault", trace: error.message }, 500);
        }
      }
    }

    return createJsonResponse({ error: "Route Unreachable" }, 404);
  }
}
