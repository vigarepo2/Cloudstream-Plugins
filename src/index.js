// ==========================================
// 1. FRONTEND UI (MILLION DOLLAR SAAS)
// ==========================================
const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CloudStream Bundle Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #fafafa; color: #0f172a; -webkit-tap-highlight-color: transparent; }
        .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 0 3px rgba(0,0,0,0.02); }
        .input-base { background: #fff; border: 1.5px solid #e2e8f0; color: #0f172a; transition: all 0.2s; outline: none; }
        .input-base:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .btn-primary { background: #0f172a; color: white; transition: all 0.2s; }
        .btn-primary:active { transform: scale(0.97); }
        .btn-primary:hover { background: #1e293b; }
        
        #toast-zone { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 99; display: flex; flex-direction: column; gap: 8px; width: 90%; max-w: 380px; }
        .toast { background: #0f172a; color: white; padding: 14px 20px; border-radius: 12px; font-weight: 600; font-size: 14px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.15); animation: dropDown 0.3s ease forwards; }
        .toast.error { background: #ef4444; }
        @keyframes dropDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .nav-link { color: #64748b; font-weight: 600; transition: color 0.2s; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
        .nav-link:hover { color: #0f172a; background: #f1f5f9; }
        .nav-link.active { color: #2563eb; background: #eff6ff; }
        
        .loader { border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; width: 22px; height: 22px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="bg-white border-b border-gray-200 sticky top-0 z-40 hidden">
        <div class="max-w-5xl mx-auto px-5 h-16 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2563eb" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span class="font-extrabold text-xl tracking-tight">CS Bundle</span>
            </div>
            <div class="hidden md:flex gap-2">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link">Dashboard</a>
                <a onclick="App.navigate('/links')" id="nav-/links" class="nav-link">Reseller Links</a>
                <a onclick="App.logout()" class="nav-link text-red-500 hover:text-red-600 hover:bg-red-50">Log Out</a>
            </div>
            <button class="md:hidden p-2 text-gray-600" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
        </div>
        <div id="mobileMenu" class="hidden md:hidden border-t border-gray-100 bg-gray-50 p-4 space-y-2">
            <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-xl shadow-sm">Dashboard</a>
            <a onclick="App.navigate('/links'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-xl shadow-sm">Manage Access Links</a>
            <a onclick="App.logout()" class="block font-bold text-red-600 p-3 bg-white rounded-xl shadow-sm mt-4">Log Out</a>
        </div>
    </nav>

    <main id="app-root" class="max-w-5xl mx-auto px-4 py-8"></main>

    <script>
      const App = {
        token: localStorage.getItem('cs_session'),
        user: localStorage.getItem('cs_user'),
        data: null,

        notify: (msg, isError = false) => {
          const zone = document.getElementById('toast-zone');
          const t = document.createElement('div');
          t.className = 'toast' + (isError ? ' error' : ''); t.innerText = msg;
          zone.appendChild(t);
          setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3500);
        },

        api: async (path, method = 'GET', body = null) => {
          const opts = { method, headers: { 'Content-Type': 'application/json' } };
          if (App.token) opts.headers['Authorization'] = App.token;
          if (body) opts.body = JSON.stringify(body);
          
          try {
              const res = await fetch(path, opts);
              const data = await res.json();
              if (!res.ok) {
                if (res.status === 401) App.logout();
                throw data;
              }
              return data;
          } catch(err) {
              if(!err.error) throw {error: "Network/Server Connection Failed"};
              throw err;
          }
        },

        init: () => {
          window.addEventListener('popstate', () => App.route(window.location.pathname));
          App.route(window.location.pathname);
        },

        navigate: (path) => {
          window.history.pushState({}, '', path);
          App.route(path);
        },

        route: (path) => {
          const root = document.getElementById('app-root');
          const nav = document.getElementById('topNav');
          
          if (!App.token && path !== '/signup') path = '/login';
          if (App.token && (path === '/' || path === '/login' || path === '/signup')) path = '/dashboard';

          if (App.token) {
            nav.classList.remove('hidden');
            document.querySelectorAll('.nav-link').forEach(e => e.classList.remove('active'));
            const activeNav = document.getElementById('nav-' + path);
            if(activeNav) activeNav.classList.add('active');
          } else {
            nav.classList.add('hidden');
          }

          if (path === '/login') root.innerHTML = App.views.login();
          else if (path === '/signup') root.innerHTML = App.views.signup();
          else if (path === '/dashboard') { root.innerHTML = App.views.dashboard(); App.loadDashboard(); }
          else if (path === '/links') { root.innerHTML = App.views.links(); App.loadLinks(); }
          else root.innerHTML = '<div class="text-center py-20 font-bold text-gray-400">Page not found</div>';
        },

        logout: () => {
          localStorage.clear();
          App.token = null; App.user = null;
          App.navigate('/login');
        },

        handleAuth: async (action) => {
          const u = document.getElementById('usr').value;
          const p = document.getElementById('pwd').value;
          if (!u || !p) return App.notify('Both fields are required.', true);
          
          const btn = document.getElementById('authBtn');
          const oldTxt = btn.innerText;
          btn.innerHTML = '<div class="loader !border-white !border-t-transparent"></div>';
          
          try {
            const res = await App.api('/api/auth', 'POST', { action, username: u, password: p });
            localStorage.setItem('cs_session', res.token);
            localStorage.setItem('cs_user', res.username);
            App.token = res.token; App.user = res.username;
            App.notify('Welcome!');
            App.navigate('/dashboard');
          } catch (e) {
            btn.innerHTML = oldTxt;
            if(e.error === 'wrong_password') {
                document.getElementById('pwd').value = '';
                App.notify('Incorrect password. Please try again.', true);
            } else if(e.error === 'user_not_found') {
                App.notify('Account not found. Check your username.', true);
            } else {
                App.notify(e.error || 'Authentication failed.', true);
            }
          }
        },

        loadDashboard: async () => {
            const base = window.location.origin;
            document.getElementById('def-movies').value = base + '/sfw/repo.json';
            document.getElementById('def-adult').value = base + '/nsfw/repo.json';
        },

        loadLinks: async () => {
            try {
                const data = await App.api('/api/links');
                App.data = data;
                App.renderLinksTable();
            } catch (e) { App.notify(e.error || 'Failed to load links', true); }
        },

        createLink: async () => {
            const customId = document.getElementById('customId').value.trim();
            const name = document.getElementById('linkName').value.trim();
            try {
                await App.api('/api/links', 'POST', { id: customId, name: name || 'Client Link' });
                App.notify('Access Link created successfully!');
                document.getElementById('customId').value = '';
                document.getElementById('linkName').value = '';
                App.loadLinks();
            } catch (e) { App.notify(e.error || 'Failed to create link', true); }
        },

        toggleLink: async (id, currentStatus) => {
            try {
                await App.api('/api/links/' + id, 'PUT', { is_active: currentStatus ? 0 : 1 });
                App.loadLinks();
            } catch(e) { App.notify('Failed to update status', true); }
        },

        deleteLink: async (id) => {
            if(!confirm('Delete this link forever? All analytics will be lost.')) return;
            try {
                await App.api('/api/links/' + id, 'DELETE');
                App.notify('Link deleted');
                App.loadLinks();
            } catch(e) {}
        },

        copy: (text) => {
            navigator.clipboard.writeText(text);
            App.notify('Copied to clipboard!');
        },

        renderLinksTable: () => {
            const tbody = document.getElementById('linksTable');
            const base = window.location.origin;
            
            if(!App.data || App.data.length === 0) {
                tbody.innerHTML = '<div class="text-center py-10 text-gray-500 font-semibold bg-white rounded-3xl shadow-soft">No access links created yet.</div>';
                return;
            }

            tbody.innerHTML = App.data.map(l => {
                const isActive = l.is_active === 1;
                const statusBadge = isActive ? '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span>' : '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">BLOCKED</span>';
                
                return \`
                <div class="bg-white p-6 rounded-3xl shadow-soft mb-4 border border-gray-100 relative overflow-hidden \${!isActive ? 'opacity-75 grayscale-[0.5]' : ''}">
                    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
                        <div>
                            <div class="flex items-center gap-3 mb-1">
                                <h3 class="font-extrabold text-lg text-gray-900">\${l.name}</h3>
                                \${statusBadge}
                            </div>
                            <p class="text-xs text-gray-400 font-mono">ID: \${l.link_id}</p>
                        </div>
                        <div class="flex gap-4 text-center bg-gray-50 px-5 py-3 rounded-2xl">
                            <div><p class="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Total Clicks</p><p class="font-extrabold text-xl text-blue-600">\${l.total_clicks}</p></div>
                            <div class="w-px bg-gray-200"></div>
                            <div><p class="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Unique Users</p><p class="font-extrabold text-xl text-blue-600">\${l.unique_visitors}</p></div>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-3 mb-5">
                        <div class="bg-gray-50 p-3 rounded-2xl flex justify-between items-center border border-gray-100">
                            <div><span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wide mb-1">Standard Library (Movies, Anime)</span><span class="text-xs font-mono text-gray-700 truncate block max-w-[200px] sm:max-w-[220px]">\${base}/\${l.link_id}/sfw/repo.json</span></div>
                            <button onclick="App.copy('\${base}/\${l.link_id}/sfw/repo.json')" class="bg-white shadow-sm border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-gray-50">Copy</button>
                        </div>
                        <div class="bg-red-50/50 p-3 rounded-2xl flex justify-between items-center border border-red-100">
                            <div><span class="block text-[10px] font-extrabold text-red-400 uppercase tracking-wide mb-1">Adult Library (18+ Porn)</span><span class="text-xs font-mono text-red-800 truncate block max-w-[200px] sm:max-w-[220px]">\${base}/\${l.link_id}/nsfw/repo.json</span></div>
                            <button onclick="App.copy('\${base}/\${l.link_id}/nsfw/repo.json')" class="bg-white shadow-sm border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-red-50">Copy</button>
                        </div>
                    </div>

                    <div class="flex gap-2 border-t border-gray-100 pt-4 mt-2">
                        <button onclick="App.toggleLink('\${l.link_id}', \${isActive})" class="flex-1 \${isActive ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-green-50 text-green-700 hover:bg-green-100'} py-2.5 rounded-xl text-xs font-bold transition">
                            \${isActive ? 'Block Access Link' : 'Unblock Access Link'}
                        </button>
                        <button onclick="App.deleteLink('\${l.link_id}')" class="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-xl text-xs font-bold transition">Delete Link Permanently</button>
                    </div>
                </div>\`;
            }).join('');
        },

        views: {
          login: () => 
            '<div class="max-w-sm mx-auto mt-12"><div class="text-center mb-10"><div class="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-soft"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="white" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div><h1 class="text-3xl font-extrabold tracking-tight">Welcome Back</h1><p class="text-gray-500 mt-2 font-medium">Sign in to your dashboard</p></div>' +
            '<div class="bg-white p-8 rounded-[32px] shadow-soft space-y-5 border border-gray-100">' +
            '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Username</label><input id="usr" class="w-full input-base px-5 py-3.5 rounded-2xl text-base font-semibold" placeholder="admin"></div>' +
            '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Password</label><input id="pwd" type="password" class="w-full input-base px-5 py-3.5 rounded-2xl text-base font-semibold" placeholder="••••••••"></div>' +
            '<div class="pt-3"><button id="authBtn" onclick="App.handleAuth(\\'login\\')" class="w-full btn-primary py-4 rounded-2xl text-base font-bold shadow-lg shadow-blue-900/10">Log In</button></div>' +
            '<button onclick="App.navigate(\\'/signup\\')" class="w-full bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl text-base mt-2 hover:bg-gray-100 transition">Create Account</button></div></div>',
            
          signup: () => 
            '<div class="max-w-sm mx-auto mt-12"><div class="text-center mb-10"><h1 class="text-3xl font-extrabold tracking-tight">Create Account</h1><p class="text-gray-500 mt-2 font-medium">Start generating reseller links</p></div>' +
            '<div class="bg-white p-8 rounded-[32px] shadow-soft space-y-5 border border-gray-100">' +
            '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Username</label><input id="usr" class="w-full input-base px-5 py-3.5 rounded-2xl text-base font-semibold" placeholder="Choose a username"></div>' +
            '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Password</label><input id="pwd" type="password" class="w-full input-base px-5 py-3.5 rounded-2xl text-base font-semibold" placeholder="Create a password"></div>' +
            '<div class="pt-3"><button id="authBtn" onclick="App.handleAuth(\\'signup\\')" class="w-full btn-primary py-4 rounded-2xl text-base font-bold shadow-lg shadow-blue-900/10">Sign Up</button></div>' +
            '<button onclick="App.navigate(\\'/login\\')" class="w-full bg-transparent text-gray-500 font-bold py-4 rounded-2xl text-base mt-2 hover:text-gray-900 transition">Back to Login</button></div></div>',

          dashboard: () => 
            '<div class="max-w-3xl mx-auto"><div class="mb-10"><h1 class="text-3xl font-extrabold text-gray-900 mb-2">Default Platform Links</h1><p class="text-gray-500 font-medium">These are your main URLs. They work without any custom IDs.</p></div>' +
            '<div class="space-y-5">' +
            '<div class="bg-white p-7 rounded-[32px] shadow-soft border border-gray-100"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5"><span class="font-extrabold text-gray-900 text-xl flex items-center gap-2"><div class="w-3 h-3 bg-blue-500 rounded-full"></div> Standard Library</span><button onclick="App.copy(document.getElementById(\\'def-movies\\').value)" class="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition">Copy URL</button></div><input id="def-movies" readonly class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-600 font-medium outline-none font-mono"></div>' +
            '<div class="bg-white p-7 rounded-[32px] shadow-soft border border-red-100"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5"><span class="font-extrabold text-red-600 text-xl flex items-center gap-2"><div class="w-3 h-3 bg-red-500 rounded-full"></div> Adult Library (18+)</span><button onclick="App.copy(document.getElementById(\\'def-adult\\').value)" class="bg-red-50 text-red-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition">Copy URL</button></div><input id="def-adult" readonly class="w-full bg-red-50/50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-800 font-medium outline-none font-mono"></div>' +
            '</div></div>',

          links: () => 
            '<div class="max-w-4xl mx-auto"><div class="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8"><div><h1 class="text-3xl font-extrabold text-gray-900 mb-2">Reseller Links</h1><p class="text-gray-500 font-medium">Create custom links for users. Track clicks and analytics.</p></div>' +
            '<div class="bg-white p-2.5 rounded-[20px] shadow-soft border border-gray-100 flex gap-2 w-full md:w-auto"><input id="customId" placeholder="ID (Optional)" maxlength="10" class="w-32 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none font-mono uppercase font-bold"><input id="linkName" placeholder="Client Name" class="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none font-medium"><button onclick="App.createLink()" class="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold">Create</button></div></div>' +
            '<div id="linksTable" class="space-y-4"><div class="py-20 text-center"><div class="loader"></div></div></div></div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;

// ==========================================
// 2. BACKEND DATABASE & UTILS
// ==========================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS } });
}

async function hashString(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateRandomId(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

// Guarantee tables exist
async function ensureDatabase(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT, session_token TEXT UNIQUE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS links (link_id TEXT PRIMARY KEY, username TEXT, name TEXT, is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS analytics (link_id TEXT, visitor_hash TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`)
  ]);
}

async function trackAnalytics(db, linkId, request) {
  try {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    const date = new Date().toISOString().split('T')[0]; 
    const visitorHash = await hashString(`${ip}-${ua}-${date}`);
    await db.prepare("INSERT INTO analytics (link_id, visitor_hash) VALUES (?, ?)").bind(linkId, visitorHash).run();
  } catch(e) {
    // Fail silently in background to not disrupt the user stream
  }
}

// ==========================================
// 3. CLOUDSTREAM AGGREGATOR ENGINE
// ==========================================

const NETWORK_SOURCES = [
  "https://raw.githubusercontent.com/SaurabhKaperwan/CSX/builds/plugins.json",
  "https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/refs/heads/builds/plugins.json",
  "https://raw.githubusercontent.com/NivinCNC/CNCVerse-Cloud-Stream-Extension/builds/plugins.json",
  "https://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds/plugins.json",
  "https://raw.githubusercontent.com/rockhero1234/cinephile/builds/plugins.json",
  "https://raw.githubusercontent.com/Sushan64/NetMirror-Extension/builds/plugins.json",
  "https://cloudstream.lasyhost.tech/plugins.json",
  "https://raw.githubusercontent.com/crafteraadarsh/vibemax/builds/plugins.json"
];

async function fetchSourceData(url, depth = 0) {
  if (depth > 2) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true }, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data.plugins) return data.plugins;
    if (data.pluginLists) {
      const subPromises = data.pluginLists.map(u => fetchSourceData(u, depth + 1));
      const subResults = await Promise.all(subPromises);
      return subResults.flat();
    }
    return [];
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }
}

async function compileAllExtensions() {
  const promises = NETWORK_SOURCES.map(url => fetchSourceData(url));
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
    } else {
      names.set(key, 1);
      item.internalName = key;
    }
    
    // Check if adult
    item.isAdult = Array.isArray(item.tvTypes) && item.tvTypes.some(t => t.toUpperCase() === "NSFW");
    processed.push(item);
  }
  return processed;
}


// ==========================================
// 4. MAIN WORKER ROUTER
// ==========================================

export default {
  // Notice the addition of ctx here. This is required for background analytics!
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const token = request.headers.get("Authorization");

    // --- API: AUTHENTICATION ---
    if (path === "/api/auth" && method === "POST") {
      try {
        await ensureDatabase(env.CS_DB); 
        const body = await request.json();
        const username = body.username?.trim().toLowerCase();
        
        if (!username || !body.password) return jsonResponse({ error: "Missing fields" }, 400);
        
        const hash = await hashString(body.password);

        if (body.action === "signup") {
          const exists = await env.CS_DB.prepare("SELECT username FROM users WHERE username = ?").bind(username).first();
          if (exists) return jsonResponse({ error: "Username already taken." }, 400);
          
          const session = generateRandomId(24);
          await env.CS_DB.prepare("INSERT INTO users (username, password, session_token) VALUES (?, ?, ?)").bind(username, hash, session).run();
          return jsonResponse({ token: session, username });
        }

        if (body.action === "login") {
          const user = await env.CS_DB.prepare("SELECT password, session_token FROM users WHERE username = ?").bind(username).first();
          if (!user) return jsonResponse({ error: "user_not_found" }, 401);
          if (user.password !== hash) return jsonResponse({ error: "wrong_password" }, 401);
          return jsonResponse({ token: user.session_token, username });
        }
      } catch (e) { 
        return jsonResponse({ error: "Database error. Check your D1 binding." }, 500); 
      }
    }

    // --- API: RESELLER LINKS ---
    if (path.startsWith("/api/links")) {
        if (!token) return jsonResponse({ error: "Unauthorized" }, 401);
        
        // Ensure Database is initialized just in case they bypassed auth
        await ensureDatabase(env.CS_DB); 
        const user = await env.CS_DB.prepare("SELECT username FROM users WHERE session_token = ?").bind(token).first();
        if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

        // GET all links with Analytics
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
            return jsonResponse(results);
        }

        // CREATE a new custom link
        if (method === "POST" && path === "/api/links") {
            const body = await request.json();
            let linkId = body.id ? body.id.toLowerCase().replace(/[^a-z0-9]/g, '') : generateRandomId(10);
            if (linkId.length === 0) linkId = generateRandomId(10);
            
            const exists = await env.CS_DB.prepare("SELECT link_id FROM links WHERE link_id = ?").bind(linkId).first();
            if (exists) return jsonResponse({ error: "That Custom ID is already taken by someone else!" }, 400);

            await env.CS_DB.prepare("INSERT INTO links (link_id, username, name) VALUES (?, ?, ?)").bind(linkId, user.username, body.name).run();
            return jsonResponse({ success: true, linkId });
        }

        // Manage Specific Link (PUT to block/unblock, DELETE to remove)
        const linkMatch = path.match(/^\/api\/links\/([a-zA-Z0-9]+)$/);
        if (linkMatch) {
            const targetId = linkMatch[1];
            
            const linkData = await env.CS_DB.prepare("SELECT username FROM links WHERE link_id = ?").bind(targetId).first();
            if(!linkData || linkData.username !== user.username) return jsonResponse({ error: "Not found" }, 404);

            if (method === "PUT") {
                const body = await request.json();
                await env.CS_DB.prepare("UPDATE links SET is_active = ? WHERE link_id = ?").bind(body.is_active, targetId).run();
                await env.CS_KV.delete(`repo_${targetId}_sfw`);
                await env.CS_KV.delete(`repo_${targetId}_nsfw`);
                return jsonResponse({ success: true });
            }

            if (method === "DELETE") {
                await env.CS_DB.batch([
                    env.CS_DB.prepare("DELETE FROM links WHERE link_id = ?").bind(targetId),
                    env.CS_DB.prepare("DELETE FROM analytics WHERE link_id = ?").bind(targetId)
                ]);
                await env.CS_KV.delete(`repo_${targetId}_sfw`);
                await env.CS_KV.delete(`repo_${targetId}_nsfw`);
                return jsonResponse({ success: true });
            }
        }
    }

    // --- REPOSITORY DELIVERY ROUTING (THE MAGIC LINKS) ---
    // Matches: /sfw/repo.json OR /CUSTOM123/sfw/repo.json
    const repoMatch = path.match(/^\/(?:([a-zA-Z0-9]+)\/)?(sfw|nsfw)\/(repo|plugins)\.json$/);
    
    if (repoMatch && method === "GET") {
      let linkId = repoMatch[1] || 'default';
      let mode = repoMatch[2]; // 'sfw' or 'nsfw'
      let file = repoMatch[3]; // 'repo' or 'plugins'

      if (linkId !== 'default') {
          await ensureDatabase(env.CS_DB); 
          const linkCheck = await env.CS_DB.prepare("SELECT is_active FROM links WHERE link_id = ?").bind(linkId).first();
          if (!linkCheck || linkCheck.is_active === 0) return jsonResponse({ error: "Access Denied or Link Disabled by Admin" }, 403);
          
          // Track the click analytics completely in the background!
          if (file === "repo") {
             ctx.waitUntil(trackAnalytics(env.CS_DB, linkId, request));
          }
      }

      const libraryName = mode === 'sfw' ? 'Standard Library (Movies & Anime)' : 'Adult Content (18+)';

      if (file === "repo") {
        const repoUrl = linkId === 'default' 
            ? `${url.origin}/${mode}/plugins.json` 
            : `${url.origin}/${linkId}/${mode}/plugins.json`;

        return jsonResponse({
          name: `CS Bundle - ${libraryName}`,
          description: `Automatically updated repository bundle.`,
          manifestVersion: 1,
          pluginLists: [repoUrl]
        });
      }

      if (file === "plugins") {
        const cacheKey = `repo_${linkId}_${mode}`;
        const cached = await env.CS_KV.get(cacheKey);
        if (cached) return new Response(cached, { headers: { "Content-Type": "application/json", ...CORS } });

        const allExt = await compileAllExtensions();
        
        const finalExt = allExt.filter(p => {
          if (mode === "sfw" && p.isAdult) return false;
          if (mode === "nsfw" && !p.isAdult) return false;
          return true;
        });

        const resData = JSON.stringify(finalExt);
        await env.CS_KV.put(cacheKey, resData, { expirationTtl: 300 }); 
        return new Response(resData, { headers: { "Content-Type": "application/json", ...CORS } });
      }
    }

    // --- SPA FRONTEND ROUTER ---
    // Only serve HTML for specific frontend routes. Return 404 for random invalid API calls.
    if (path === "/" || path === "/login" || path === "/signup" || path === "/dashboard" || path === "/links") {
      return new Response(uiHTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return jsonResponse({ error: "Endpoint Not Found" }, 404);
  }
};
