export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CloudStream Bundle</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #fafafa; --surface: #ffffff; --border: #e4e4e7; --text-main: #18181b; --text-muted: #71717a; --accent: #09090b; }
        body { font-family: 'Inter', -apple-system, sans-serif; background-color: var(--bg); color: var(--text-main); -webkit-tap-highlight-color: transparent; overflow-x: hidden; }
        
        /* Ultra-Dense Components */
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: all 0.15s ease; }
        .card:hover { border-color: #a1a1aa; }
        .input-field { background: var(--surface); border: 1px solid var(--border); color: var(--text-main); border-radius: 8px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.01); }
        .input-field:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 1px var(--accent); }
        
        /* Buttons */
        .btn-primary { background: var(--accent); color: #fff; border-radius: 8px; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .btn-primary:hover { background: #27272a; transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }
        .btn-secondary { background: #fff; color: var(--text-main); border: 1px solid var(--border); border-radius: 8px; font-weight: 600; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .btn-secondary:hover { background: #f4f4f5; border-color: #d4d4d8; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }

        /* Toasts */
        #toast-zone { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; flex-direction: column; gap: 8px; pointer-events: none; width: 90%; max-width: 300px; }
        .toast { background: var(--text-main); color: #fff; padding: 10px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .toast.error { background: #ef4444; }
        @keyframes fadeUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Nav */
        .nav-link { color: var(--text-muted); font-weight: 600; padding: 6px 12px; border-radius: 6px; font-size: 13px; transition: all 0.2s; cursor: pointer; }
        .nav-link:hover { color: var(--text-main); background: #f4f4f5; }
        .nav-link.active { color: var(--text-main); background: #e4e4e7; }

        /* Toggle Switch */
        .switch { position: relative; display: inline-block; width: 28px; height: 16px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .2s; border-radius: 16px; }
        .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px; background-color: white; transition: .2s; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        input:checked + .slider { background-color: var(--accent); }
        input:checked + .slider:before { transform: translateX(12px); }

        .loader { border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; width: 14px; height: 14px; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .plugin-item { animation: fadeIn 0.2s ease forwards; }
        .plugin-item.selected { border-color: var(--accent); background-color: #fafafa; box-shadow: 0 0 0 1px var(--accent); }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="bg-white border-b border-zinc-200 sticky top-0 z-40 hidden w-full">
        <div class="w-full max-w-[100rem] mx-auto px-3 sm:px-6 lg:px-8 h-12 flex justify-between items-center">
            <div class="flex items-center gap-2.5">
                <span class="font-extrabold text-[15px] tracking-tight text-zinc-900">CS Bundle</span>
                <span id="syncTag" class="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider hidden">Saving</span>
            </div>
            
            <div class="hidden md:flex gap-1 items-center">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link">Dashboard</a>
                <a onclick="App.navigate('/plugins')" id="nav-/plugins" class="nav-link">Extensions</a>
                <a onclick="App.navigate('/settings')" id="nav-/settings" class="nav-link">Settings</a>
                <div class="w-px h-3 bg-zinc-300 mx-2"></div>
                <a onclick="App.logout()" class="nav-link text-red-600 hover:bg-red-50">Log Out</a>
            </div>
            
            <button class="md:hidden p-1.5 text-zinc-600 rounded-md hover:bg-zinc-100 transition" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </div>
        
        <div id="mobileMenu" class="hidden md:hidden absolute w-full bg-white border-b border-zinc-200 px-3 py-2 space-y-1 shadow-lg">
            <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-zinc-800 font-bold p-2 rounded-md hover:bg-zinc-50 text-sm">Dashboard</a>
            <a onclick="App.navigate('/plugins'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-zinc-800 font-bold p-2 rounded-md hover:bg-zinc-50 text-sm">Extensions</a>
            <a onclick="App.navigate('/settings'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-zinc-800 font-bold p-2 rounded-md hover:bg-zinc-50 text-sm">Settings</a>
            <a onclick="App.logout()" class="block text-red-600 font-bold p-2 rounded-md hover:bg-red-50 text-sm border-t border-zinc-100 mt-1">Log Out</a>
        </div>
    </nav>

    <main id="app-root" class="w-full max-w-[100rem] mx-auto px-3 sm:px-6 lg:px-8 py-6 overflow-hidden"></main>

    <script>
      const App = {
        token: localStorage.getItem('cs_session'),
        user: localStorage.getItem('cs_user'),
        extData: null,
        selected: new Set(),
        customSources: [],
        filterType: 'all',
        saveTimer: null,

        notify: (msg, isError = false) => {
          const zone = document.getElementById('toast-zone');
          const t = document.createElement('div');
          t.className = 'toast' + (isError ? ' error' : ''); 
          t.innerHTML = isError 
            ? \`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> \${msg}\`
            : \`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> \${msg}\`;
          zone.appendChild(t);
          setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.2s'; setTimeout(() => t.remove(), 200); }, 2500);
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
              if(!err.error) throw {error: "Network Error"};
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
          else if (path === '/plugins') { root.innerHTML = App.views.plugins(); App.loadPlugins(); }
          else if (path === '/settings') { root.innerHTML = App.views.settings(); App.loadSettings(); }
        },

        logout: () => {
          localStorage.clear();
          sessionStorage.clear();
          App.token = null; App.user = null; App.extData = null;
          App.navigate('/login');
        },

        handleAuth: async (action) => {
          const u = document.getElementById('usr').value;
          const p = document.getElementById('pwd').value;
          if (!u || !p) return App.notify('Required fields missing', true);
          
          const btn = document.getElementById('authBtn');
          const oldTxt = btn.innerText;
          btn.innerHTML = '<div class="loader !border-zinc-500 !border-t-white mx-auto"></div>';
          
          try {
            const res = await App.api('/api/auth', 'POST', { action, username: u, password: p });
            localStorage.setItem('cs_session', res.token);
            localStorage.setItem('cs_user', res.username);
            App.token = res.token; App.user = res.username;
            App.navigate('/dashboard');
          } catch (e) {
            btn.innerHTML = oldTxt;
            App.notify(e.error || 'Auth failed', true);
          }
        },

        loadDashboard: () => {
            const base = window.location.origin;
            document.getElementById('def-all').value = base + '/' + App.user + '/all/repo.json';
            document.getElementById('def-movies').value = base + '/' + App.user + '/sfw/repo.json';
            document.getElementById('def-adult').value = base + '/' + App.user + '/nsfw/repo.json';
        },

        loadPlugins: async () => {
            const cachedData = sessionStorage.getItem('cs_ext_cache');
            const cachedMe = sessionStorage.getItem('cs_me_cache');
            
            if (cachedData && cachedMe) {
                App.extData = JSON.parse(cachedData);
                const me = JSON.parse(cachedMe);
                App.selected = new Set(me.selected);
                App.customSources = me.sources;
                App.renderExtGrid();
            } else {
                document.getElementById('extGrid').innerHTML = '<div class="col-span-full py-10 flex justify-center"><div class="loader !w-6 !h-6"></div></div>';
            }

            try {
                const me = await App.api('/api/me');
                App.selected = new Set(me.selected);
                App.customSources = me.sources;
                sessionStorage.setItem('cs_me_cache', JSON.stringify(me));

                const freshData = await App.api('/api/plugins');
                App.extData = freshData;
                sessionStorage.setItem('cs_ext_cache', JSON.stringify(freshData));
                
                App.renderExtGrid(); 
            } catch (e) { 
                if(!cachedData) App.notify('Failed to load extensions', true); 
            }
        },

        refreshPlugins: async () => {
            const btn = document.getElementById('refreshBtn');
            const originalTxt = btn.innerHTML;
            btn.innerHTML = '<div class="loader !w-3 !h-3 inline-block"></div>';
            
            try {
                const freshData = await App.api('/api/plugins/refresh', 'POST');
                App.extData = freshData;
                sessionStorage.setItem('cs_ext_cache', JSON.stringify(freshData));
                App.renderExtGrid();
                App.notify('Synced globally');
            } catch (e) { App.notify('Sync failed', true); }
            btn.innerHTML = originalTxt;
        },

        saveSelections: () => {
            document.getElementById('syncTag').classList.remove('hidden');
            const meCache = { selected: Array.from(App.selected), sources: App.customSources };
            sessionStorage.setItem('cs_me_cache', JSON.stringify(meCache));

            clearTimeout(App.saveTimer);
            App.saveTimer = setTimeout(async () => {
                try {
                    await App.api('/api/me/plugins', 'POST', meCache);
                    setTimeout(() => document.getElementById('syncTag').classList.add('hidden'), 500);
                } catch (e) { App.notify('Auto-save failed', true); document.getElementById('syncTag').classList.add('hidden'); }
            }, 800);
        },

        togglePlugin: (id) => {
            if(App.selected.has(id)) App.selected.delete(id);
            else App.selected.add(id);
            App.renderExtGrid();
            App.saveSelections();
        },

        setFilter: (type) => { 
            App.filterType = type;
            ['all', 'sfw', 'nsfw'].forEach(t => {
                const btn = document.getElementById('f-' + t);
                if(t === type) { 
                    btn.className = "flex-1 sm:flex-none px-3 py-1.5 rounded-[6px] text-[11px] font-bold bg-zinc-900 text-white shadow-sm border border-zinc-900"; 
                } else { 
                    btn.className = "flex-1 sm:flex-none px-3 py-1.5 rounded-[6px] text-[11px] font-bold text-zinc-600 hover:bg-zinc-200/50 transition border border-transparent"; 
                }
            });
            App.renderExtGrid();
        },

        // FIXED IMAGE RENDER LOGIC
        renderExtGrid: () => {
            const grid = document.getElementById('extGrid');
            if (!App.extData) return;

            let html = '';
            // Safely encoded SVG for broken image fallbacks
            const fallbackSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23f4f4f5' rx='6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23a1a1aa'%3ENA%3C/text%3E%3C/svg%3E";

            App.extData.forEach(p => {
                if (App.filterType === 'sfw' && p.isAdult) return;
                if (App.filterType === 'nsfw' && !p.isAdult) return;

                const isSelected = App.selected.has(p.internalName);
                
                // Icon Fix Logic
                let iconUrl = p.iconUrl || p.icon || '';
                if(iconUrl) {
                    iconUrl = iconUrl.replace('%size%', '128'); // Fix Google placeholder
                    if (iconUrl.startsWith('http://')) iconUrl = iconUrl.replace('http://', 'https://'); // Fix HTTP Mixed Content error
                }

                // Image with safe onerror fallback
                const img = iconUrl 
                    ? \`<img src="\${iconUrl}" onerror="this.onerror=null; this.src='\${fallbackSvg}';" class="w-8 h-8 rounded-md object-cover bg-zinc-50 border border-zinc-200 shrink-0">\` 
                    : \`<img src="\${fallbackSvg}" class="w-8 h-8 rounded-md object-cover bg-zinc-50 border border-zinc-200 shrink-0">\`;
                
                let badge = p.isAdult 
                    ? '<span class="text-red-700 bg-red-50 border border-red-200 px-1.5 py-[1px] rounded-[4px] text-[8px] font-extrabold tracking-wide">NSFW 18+</span>' 
                    : '<span class="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-[1px] rounded-[4px] text-[8px] font-extrabold tracking-wide">SAFE</span>';

                html += \`
                <div class="card p-2 plugin-item cursor-pointer select-none flex flex-col justify-between \${isSelected ? 'selected' : ''}" onclick="App.togglePlugin('\${p.internalName}')">
                    <div class="flex items-start justify-between gap-1.5 mb-1.5">
                        <div class="flex gap-2 items-center min-w-0 flex-1">
                            \${img}
                            <div class="min-w-0">
                                <h3 class="font-bold text-zinc-900 text-[11px] leading-tight truncate" title="\${p.name}">\${p.name}</h3>
                                <p class="text-[9px] text-zinc-500 font-semibold truncate mt-0.5">\${Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'Community')}</p>
                            </div>
                        </div>
                        <label class="switch shrink-0 pointer-events-none mt-0.5">
                            <input type="checkbox" \${isSelected ? 'checked' : ''}><span class="slider"></span>
                        </label>
                    </div>
                    <div class="flex flex-wrap items-center gap-1 mt-auto pt-1">
                        \${badge}
                        <span class="text-zinc-600 bg-zinc-100 border border-zinc-200 px-1.5 py-[1px] rounded-[4px] text-[8px] font-bold uppercase tracking-wide">\${p.language || 'EN'}</span>
                        <span class="text-zinc-600 bg-zinc-100 border border-zinc-200 px-1.5 py-[1px] rounded-[4px] text-[8px] font-bold tracking-wide">v\${p.version || 1}</span>
                    </div>
                </div>\`;
            });
            grid.innerHTML = html || '<div class="col-span-full text-center text-zinc-500 py-10 font-bold text-xs">No extensions match your filter.</div>';
            document.getElementById('selCount').innerText = App.selected.size;
        },

        addSource: () => {
            const input = document.getElementById('newSrc');
            const val = input.value.trim();
            if(!val.startsWith('http')) return App.notify('Invalid URL', true);
            App.customSources.push(val);
            input.value = '';
            App.saveSelections();
            App.renderSources();
            App.refreshPlugins();
        },

        removeSource: (index) => {
            App.customSources.splice(index, 1);
            App.saveSelections();
            App.renderSources();
            App.refreshPlugins();
        },

        loadSettings: async () => {
            try {
                document.getElementById('currentUsr').innerText = App.user;
                const cachedMe = sessionStorage.getItem('cs_me_cache');
                if (cachedMe) {
                    App.customSources = JSON.parse(cachedMe).sources;
                    App.renderSources();
                }
                const me = await App.api('/api/me');
                App.customSources = me.sources;
                sessionStorage.setItem('cs_me_cache', JSON.stringify(me));
                App.renderSources();
            } catch (e) {}
        },

        updateCredentials: async () => {
            const u = document.getElementById('newUsr').value;
            const p = document.getElementById('newPwd').value;
            if (!u && !p) return App.notify('Fill at least one field', true);
            try {
                const res = await App.api('/api/me/credentials', 'PUT', { username: u, password: p });
                if(res.username) { localStorage.setItem('cs_user', res.username); App.user = res.username; }
                App.notify('Profile updated');
                document.getElementById('newUsr').value = ''; document.getElementById('newPwd').value = '';
                App.loadSettings();
            } catch (e) { App.notify(e.error, true); }
        },

        renderSources: () => {
            const list = document.getElementById('sourceList');
            if(!list) return;
            list.innerHTML = App.customSources.map((s, i) => \`
                <div class="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0 gap-2">
                    <span class="text-[10px] font-mono text-zinc-600 truncate flex-1">\${s}</span>
                    <button onclick="App.removeSource(\${i})" class="text-red-600 text-[10px] font-bold hover:bg-red-50 transition px-2 py-1 rounded border border-red-100 shrink-0">Del</button>
                </div>
            \`).join('') || '<p class="text-[10px] font-bold text-zinc-400 py-2 uppercase tracking-wide">No custom sources</p>';
        },

        copy: (id) => {
            const el = document.getElementById(id);
            navigator.clipboard.writeText(el.value);
            App.notify('Link Copied!');
        },

        views: {
          login: () => 
            '<div class="min-h-[70vh] flex items-center justify-center w-full px-3"><div class="w-full max-w-sm"><div class="text-center mb-5"><h1 class="text-2xl font-extrabold tracking-tight text-zinc-900 mb-1">Access Hub</h1><p class="text-zinc-500 text-xs font-medium">Log in to manage your extension bundle</p></div>' +
            '<div class="card p-5 space-y-3.5">' +
            '<div><label class="text-[10px] font-bold text-zinc-700 mb-1 block uppercase tracking-wide">Username</label><input id="usr" class="w-full input-field px-3 py-2 text-xs font-semibold" placeholder="Enter username"></div>' +
            '<div><label class="text-[10px] font-bold text-zinc-700 mb-1 block uppercase tracking-wide">Password</label><input id="pwd" type="password" class="w-full input-field px-3 py-2 text-xs font-semibold" placeholder="••••••••"></div>' +
            '<div class="pt-1"><button id="authBtn" onclick="App.handleAuth(\\'login\\')" class="w-full btn-primary py-2.5 text-xs">Log In</button></div>' +
            '<div class="text-center mt-2"><button onclick="App.navigate(\\'/signup\\')" class="text-[11px] text-zinc-500 hover:text-zinc-900 font-bold transition">Create a new workspace</button></div></div></div></div>',
            
          signup: () => 
            '<div class="min-h-[70vh] flex items-center justify-center w-full px-3"><div class="w-full max-w-sm"><div class="text-center mb-5"><h1 class="text-2xl font-extrabold tracking-tight text-zinc-900 mb-1">Initialize Hub</h1><p class="text-zinc-500 text-xs font-medium">Create your personal sync environment</p></div>' +
            '<div class="card p-5 space-y-3.5">' +
            '<div><label class="text-[10px] font-bold text-zinc-700 mb-1 block uppercase tracking-wide">Username</label><input id="usr" class="w-full input-field px-3 py-2 text-xs font-semibold" placeholder="Choose a username"></div>' +
            '<div><label class="text-[10px] font-bold text-zinc-700 mb-1 block uppercase tracking-wide">Password</label><input id="pwd" type="password" class="w-full input-field px-3 py-2 text-xs font-semibold" placeholder="Create a password"></div>' +
            '<div class="pt-1"><button id="authBtn" onclick="App.handleAuth(\\'signup\\')" class="w-full btn-primary py-2.5 text-xs">Deploy Workspace</button></div>' +
            '<div class="text-center mt-2"><button onclick="App.navigate(\\'/login\\')" class="text-[11px] text-zinc-500 hover:text-zinc-900 font-bold transition">Back to Login</button></div></div></div></div>',

          dashboard: () => 
            '<div class="max-w-2xl mx-auto"><div class="mb-5"><h1 class="text-lg font-extrabold text-zinc-900 mb-0.5">Integration Nodes</h1><p class="text-zinc-500 text-[11px] font-medium">Copy these URLs directly into your CloudStream app repository settings.</p></div>' +
            '<div class="space-y-3">' +
            '<div class="card p-4"><div class="flex justify-between items-center mb-2"><h3 class="text-xs font-bold text-zinc-900 flex items-center gap-1.5"><div class="w-1.5 h-1.5 bg-zinc-900 rounded-full"></div> All Extensions</h3><button onclick="App.copy(\\'def-all\\')" class="btn-secondary px-2.5 py-1 text-[10px]">Copy</button></div><input id="def-all" readonly class="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-zinc-600 font-mono outline-none"></div>' +
            '<div class="card p-4"><div class="flex justify-between items-center mb-2"><h3 class="text-xs font-bold text-emerald-700 flex items-center gap-1.5"><div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Safe Content Only</h3><button onclick="App.copy(\\'def-movies\\')" class="btn-secondary px-2.5 py-1 text-[10px]">Copy</button></div><input id="def-movies" readonly class="w-full bg-emerald-50/30 border border-emerald-100 rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 font-mono outline-none"></div>' +
            '<div class="card p-4"><div class="flex justify-between items-center mb-2"><h3 class="text-xs font-bold text-red-700 flex items-center gap-1.5"><div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Adult (18+) Only</h3><button onclick="App.copy(\\'def-adult\\')" class="bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-md px-2.5 py-1 text-[10px] font-bold transition">Copy</button></div><input id="def-adult" readonly class="w-full bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-red-700 font-mono outline-none"></div>' +
            '</div></div>',
            
          plugins: () =>
            '<div class="flex flex-col w-full">' +
                '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 w-full bg-white p-2 rounded-xl border border-zinc-200 shadow-sm">' +
                  '<div class="flex gap-1 bg-zinc-100 p-1 rounded-lg w-full sm:w-auto">' +
                     '<button id="f-all" onclick="App.setFilter(\\'all\\')" class="flex-1 sm:flex-none px-3 py-1.5 rounded-[6px] text-[11px] font-bold bg-zinc-900 text-white shadow-sm border border-zinc-900">Global</button>' +
                     '<button id="f-sfw" onclick="App.setFilter(\\'sfw\\')" class="flex-1 sm:flex-none px-3 py-1.5 rounded-[6px] text-[11px] font-bold text-zinc-600 hover:bg-zinc-200/50 transition border border-transparent">Safe Only</button>' +
                     '<button id="f-nsfw" onclick="App.setFilter(\\'nsfw\\')" class="flex-1 sm:flex-none px-3 py-1.5 rounded-[6px] text-[11px] font-bold text-zinc-600 hover:bg-zinc-200/50 transition border border-transparent">NSFW</button>' +
                  '</div>' +
                  '<div class="flex items-center justify-between w-full sm:w-auto gap-4 px-2">' +
                      '<div class="text-[11px] font-bold text-zinc-500 uppercase tracking-wide"><span id="selCount" class="text-zinc-900 text-sm">0</span> Active</div>' +
                      '<button id="refreshBtn" onclick="App.refreshPlugins()" class="btn-secondary px-2.5 py-1.5 text-[10px] flex items-center gap-1"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg> Sync</button>' +
                  '</div>' +
                '</div>' +
                '<div id="extGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-2.5 pb-8 w-full"></div>' +
            '</div>',

          settings: () => 
            '<div class="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">' +
                '<div class="flex-1 card p-5">' +
                    '<h2 class="font-extrabold text-sm text-zinc-900 mb-0.5">Access Control</h2>' +
                    '<p class="text-[10px] font-semibold text-zinc-500 mb-4 uppercase tracking-wide">Current Identity: <span id="currentUsr" class="text-zinc-900"></span></p>' +
                    '<div class="space-y-3 mb-4">' +
                        '<div><label class="text-[10px] font-bold text-zinc-700 mb-1 block uppercase tracking-wide">New Username</label><input id="newUsr" class="w-full input-field px-3 py-2 text-xs font-semibold" placeholder="Optional"></div>' +
                        '<div><label class="text-[10px] font-bold text-zinc-700 mb-1 block uppercase tracking-wide">New Password</label><input id="newPwd" type="password" class="w-full input-field px-3 py-2 text-xs font-semibold" placeholder="Optional"></div>' +
                    '</div>' +
                    '<button onclick="App.updateCredentials()" class="btn-primary px-3 py-2 text-[11px] w-full sm:w-auto">Update Identity</button>' +
                '</div>' +
                '<div class="flex-1 card p-5">' +
                    '<h2 class="font-extrabold text-sm text-zinc-900 mb-0.5">Data Ingestion</h2>' +
                    '<p class="text-[10px] font-semibold text-zinc-500 mb-4 uppercase tracking-wide">Inject external plugins.json URLs</p>' +
                    '<div class="flex gap-2 mb-3"><input id="newSrc" class="flex-1 input-field px-3 py-2 text-[10px] font-mono font-semibold" placeholder="https://..."><button onclick="App.addSource()" class="btn-secondary px-3 py-2 text-[11px]">Inject</button></div>' +
                    '<div id="sourceList" class="max-h-48 overflow-y-auto pr-1 border-t border-zinc-100 mt-2"></div>' +
                '</div>' +
            '</div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;
