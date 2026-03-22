export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CloudStream Bundle</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #fafafa; --surface: #ffffff; --border: #e4e4e7; --text-main: #18181b; --text-muted: #71717a; --accent: #000000; }
        body { font-family: 'Inter', -apple-system, sans-serif; background-color: var(--bg); color: var(--text-main); -webkit-tap-highlight-color: transparent; overflow-x: hidden; }
        
        /* Premium Components */
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: border-color 0.2s; }
        .card:hover { border-color: #d4d4d8; }
        .input-field { background: var(--surface); border: 1px solid var(--border); color: var(--text-main); border-radius: 8px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.01); }
        .input-field:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 1px var(--accent); }
        
        /* Buttons */
        .btn-primary { background: var(--accent); color: #fff; border-radius: 8px; font-weight: 500; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .btn-primary:hover { background: #27272a; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn-primary:active { transform: translateY(0); }
        .btn-secondary { background: #fff; color: var(--text-main); border: 1px solid var(--border); border-radius: 8px; font-weight: 500; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .btn-secondary:hover { background: #f4f4f5; border-color: #d4d4d8; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }

        /* Toasts */
        #toast-zone { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; flex-direction: column; gap: 8px; pointer-events: none; width: 90%; max-width: 320px; }
        .toast { background: var(--text-main); color: #fff; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .toast.error { background: #ef4444; }
        @keyframes fadeUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

        /* Nav */
        .nav-link { color: var(--text-muted); font-weight: 500; padding: 6px 12px; border-radius: 6px; font-size: 14px; transition: all 0.2s; cursor: pointer; }
        .nav-link:hover { color: var(--text-main); background: #f4f4f5; }
        .nav-link.active { color: var(--text-main); font-weight: 600; }

        /* Toggle */
        .switch { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .2s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .2s; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        input:checked + .slider { background-color: var(--accent); }
        input:checked + .slider:before { transform: translateX(16px); }

        .loader { border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; width: 16px; height: 16px; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .plugin-item { animation: fadeIn 0.3s ease forwards; }
        .plugin-item.selected { border-color: var(--accent); background-color: #fafafa; }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="bg-white border-b border-zinc-200 sticky top-0 z-40 hidden w-full">
        <div class="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="font-bold text-base tracking-tight text-zinc-900">CloudStream Bundle</span>
                <span id="syncTag" class="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full hidden">Saving</span>
            </div>
            
            <div class="hidden md:flex gap-1 items-center">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link">Dashboard</a>
                <a onclick="App.navigate('/plugins')" id="nav-/plugins" class="nav-link">Extensions</a>
                <a onclick="App.navigate('/settings')" id="nav-/settings" class="nav-link">Settings</a>
                <div class="w-px h-4 bg-zinc-300 mx-2"></div>
                <a onclick="App.logout()" class="nav-link text-red-600 hover:bg-red-50">Log Out</a>
            </div>
            
            <button class="md:hidden p-2 text-zinc-600 rounded-md hover:bg-zinc-100 transition" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </div>
        
        <div id="mobileMenu" class="hidden md:hidden absolute w-full bg-white border-b border-zinc-200 px-4 py-2 space-y-1 shadow-lg">
            <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-zinc-700 font-medium p-2.5 rounded-md hover:bg-zinc-50 text-sm">Dashboard</a>
            <a onclick="App.navigate('/plugins'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-zinc-700 font-medium p-2.5 rounded-md hover:bg-zinc-50 text-sm">Extensions</a>
            <a onclick="App.navigate('/settings'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-zinc-700 font-medium p-2.5 rounded-md hover:bg-zinc-50 text-sm">Settings</a>
            <a onclick="App.logout()" class="block text-red-600 font-medium p-2.5 rounded-md hover:bg-red-50 text-sm mt-1 border-t border-zinc-100">Log Out</a>
        </div>
    </nav>

    <main id="app-root" class="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden"></main>

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
            ? \`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> \${msg}\`
            : \`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> \${msg}\`;
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
              if(!err.error) throw {error: "Network/Server Error"};
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
          if (!u || !p) return App.notify('Credentials required', true);
          
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
            App.notify(e.error || 'Authentication failed', true);
          }
        },

        loadDashboard: () => {
            const base = window.location.origin;
            document.getElementById('def-all').value = base + '/' + App.user + '/all/repo.json';
            document.getElementById('def-movies').value = base + '/' + App.user + '/sfw/repo.json';
            document.getElementById('def-adult').value = base + '/' + App.user + '/nsfw/repo.json';
        },

        // SWR Caching Implementation for Instant Loads
        loadPlugins: async () => {
            // 1. Instantly load from sessionStorage if available
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

            // 2. Fetch fresh data silently in background
            try {
                const me = await App.api('/api/me');
                App.selected = new Set(me.selected);
                App.customSources = me.sources;
                sessionStorage.setItem('cs_me_cache', JSON.stringify(me));

                const freshData = await App.api('/api/plugins');
                App.extData = freshData;
                sessionStorage.setItem('cs_ext_cache', JSON.stringify(freshData));
                
                App.renderExtGrid(); // Update view with fresh data
            } catch (e) { 
                if(!cachedData) App.notify('Failed to load extensions', true); 
            }
        },

        refreshPlugins: async () => {
            const btn = document.getElementById('refreshBtn');
            const originalTxt = btn.innerHTML;
            btn.innerHTML = '<div class="loader !w-3 !h-3 inline-block"></div> Refreshing...';
            
            try {
                const freshData = await App.api('/api/plugins/refresh', 'POST');
                App.extData = freshData;
                sessionStorage.setItem('cs_ext_cache', JSON.stringify(freshData));
                App.renderExtGrid();
                App.notify('Extensions synced globally');
            } catch (e) { App.notify('Failed to sync', true); }
            btn.innerHTML = originalTxt;
        },

        saveSelections: () => {
            document.getElementById('syncTag').classList.remove('hidden');
            
            // Update cache immediately
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
                    btn.className = "px-4 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 text-white shadow-sm"; 
                } else { 
                    btn.className = "px-4 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-200/50 transition bg-transparent"; 
                }
            });
            App.renderExtGrid();
        },

        renderExtGrid: () => {
            const grid = document.getElementById('extGrid');
            if (!App.extData) return;

            let html = '';
            App.extData.forEach(p => {
                if (App.filterType === 'sfw' && p.isAdult) return;
                if (App.filterType === 'nsfw' && !p.isAdult) return;

                const isSelected = App.selected.has(p.internalName);
                const img = p.iconUrl || p.icon ? \`<img src="\${p.iconUrl || p.icon}" class="w-10 h-10 rounded-lg object-cover bg-zinc-50 border border-zinc-100 shrink-0" loading="lazy">\` : \`<div class="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-[9px] font-semibold border border-zinc-200 shrink-0">NA</div>\`;
                
                let badge = p.isAdult 
                    ? '<span class="text-red-700 bg-red-50 px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold tracking-wide">NSFW</span>' 
                    : '';

                html += \`
                <div class="card p-3 plugin-item cursor-pointer select-none flex flex-col justify-between \${isSelected ? 'selected' : ''}" onclick="App.togglePlugin('\${p.internalName}')">
                    <div class="flex items-start justify-between gap-3 mb-2">
                        <div class="flex gap-2.5 items-center w-[80%]">
                            \${img}
                            <div class="min-w-0">
                                <h3 class="font-semibold text-zinc-900 text-sm truncate" title="\${p.name}">\${p.name}</h3>
                                <p class="text-[11px] text-zinc-500 font-medium truncate mt-0.5">\${Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'Community')}</p>
                            </div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" \${isSelected ? 'checked' : ''}><span class="slider"></span>
                        </label>
                    </div>
                    <div class="flex flex-wrap items-center gap-1 mt-1">
                        \${badge}
                        <span class="text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wide">\${p.language || 'EN'}</span>
                        <span class="text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold tracking-wide">v\${p.version || 1}</span>
                    </div>
                </div>\`;
            });
            grid.innerHTML = html || '<div class="col-span-full text-center text-zinc-500 py-10 font-medium text-sm">No extensions found.</div>';
            document.getElementById('selCount').innerText = App.selected.size;
        },

        addSource: () => {
            const input = document.getElementById('newSrc');
            const val = input.value.trim();
            if(!val.startsWith('http')) return App.notify('Please enter a valid URL', true);
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
            if (!u && !p) return App.notify('Please enter new details', true);
            try {
                const res = await App.api('/api/me/credentials', 'PUT', { username: u, password: p });
                if(res.username) { localStorage.setItem('cs_user', res.username); App.user = res.username; }
                App.notify('Profile updated successfully');
                document.getElementById('newUsr').value = ''; document.getElementById('newPwd').value = '';
                App.loadSettings();
            } catch (e) { App.notify(e.error, true); }
        },

        renderSources: () => {
            const list = document.getElementById('sourceList');
            if(!list) return;
            list.innerHTML = App.customSources.map((s, i) => \`
                <div class="flex justify-between items-center py-2.5 border-b border-zinc-100 last:border-0">
                    <span class="text-xs font-mono text-zinc-600 truncate pr-4">\${s}</span>
                    <button onclick="App.removeSource(\${i})" class="text-red-500 text-xs font-medium hover:text-red-700 transition px-2 py-1 bg-red-50 rounded-md">Remove</button>
                </div>
            \`).join('') || '<p class="text-xs text-zinc-400 py-3">No custom sources added.</p>';
        },

        copy: (id) => {
            const el = document.getElementById(id);
            navigator.clipboard.writeText(el.value);
            App.notify('Link copied to clipboard');
        },

        views: {
          login: () => 
            '<div class="min-h-[70vh] flex items-center justify-center w-full px-2"><div class="w-full max-w-sm"><div class="text-center mb-6"><h1 class="text-2xl font-bold tracking-tight text-zinc-900 mb-1">Welcome Back</h1><p class="text-zinc-500 text-sm">Sign in to your Bundle workspace</p></div>' +
            '<div class="card p-6 space-y-4">' +
            '<div><label class="text-xs font-semibold text-zinc-700 mb-1.5 block">Username</label><input id="usr" class="w-full input-field px-3 py-2 text-sm" placeholder="Enter username"></div>' +
            '<div><label class="text-xs font-semibold text-zinc-700 mb-1.5 block">Password</label><input id="pwd" type="password" class="w-full input-field px-3 py-2 text-sm" placeholder="••••••••"></div>' +
            '<div class="pt-2"><button id="authBtn" onclick="App.handleAuth(\\'login\\')" class="w-full btn-primary py-2.5 text-sm">Log In</button></div>' +
            '<div class="text-center mt-3"><button onclick="App.navigate(\\'/signup\\')" class="text-xs text-zinc-500 hover:text-zinc-900 font-medium transition">Create an account</button></div></div></div></div>',
            
          signup: () => 
            '<div class="min-h-[70vh] flex items-center justify-center w-full px-2"><div class="w-full max-w-sm"><div class="text-center mb-6"><h1 class="text-2xl font-bold tracking-tight text-zinc-900 mb-1">Create Account</h1><p class="text-zinc-500 text-sm">Initialize your workspace</p></div>' +
            '<div class="card p-6 space-y-4">' +
            '<div><label class="text-xs font-semibold text-zinc-700 mb-1.5 block">Username</label><input id="usr" class="w-full input-field px-3 py-2 text-sm" placeholder="Choose a username"></div>' +
            '<div><label class="text-xs font-semibold text-zinc-700 mb-1.5 block">Password</label><input id="pwd" type="password" class="w-full input-field px-3 py-2 text-sm" placeholder="Create a password"></div>' +
            '<div class="pt-2"><button id="authBtn" onclick="App.handleAuth(\\'signup\\')" class="w-full btn-primary py-2.5 text-sm">Sign Up</button></div>' +
            '<div class="text-center mt-3"><button onclick="App.navigate(\\'/login\\')" class="text-xs text-zinc-500 hover:text-zinc-900 font-medium transition">Already have an account? Log in</button></div></div></div></div>',

          dashboard: () => 
            '<div class="max-w-3xl mx-auto"><div class="mb-6"><h1 class="text-xl font-bold text-zinc-900 mb-1">Dashboard Links</h1><p class="text-zinc-500 text-sm">Copy these URLs into the app to sync your selected extensions.</p></div>' +
            '<div class="space-y-3">' +
            '<div class="card p-4 sm:p-5"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-2"><h3 class="text-sm font-semibold text-zinc-900">All Extensions</h3><button onclick="App.copy(\\'def-all\\')" class="btn-secondary px-3 py-1.5 text-xs">Copy Link</button></div><input id="def-all" readonly class="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-600 font-mono outline-none"></div>' +
            '<div class="card p-4 sm:p-5"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-2"><h3 class="text-sm font-semibold text-zinc-900">Safe Content Only</h3><button onclick="App.copy(\\'def-movies\\')" class="btn-secondary px-3 py-1.5 text-xs">Copy Link</button></div><input id="def-movies" readonly class="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-xs text-zinc-600 font-mono outline-none"></div>' +
            '<div class="card p-4 sm:p-5 border-red-100 bg-red-50/30"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-2"><h3 class="text-sm font-semibold text-red-700">Adult Content (18+)</h3><button onclick="App.copy(\\'def-adult\\')" class="bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-md px-3 py-1.5 text-xs font-medium transition">Copy Link</button></div><input id="def-adult" readonly class="w-full bg-white border border-red-200 rounded-md px-3 py-2 text-xs text-red-700 font-mono outline-none"></div>' +
            '</div></div>',
            
          plugins: () =>
            '<div class="flex flex-col w-full">' +
                '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 w-full">' +
                  '<div class="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 w-full sm:w-auto">' +
                     '<button id="f-all" onclick="App.setFilter(\\'all\\')" class="flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 text-white shadow-sm">All</button>' +
                     '<button id="f-sfw" onclick="App.setFilter(\\'sfw\\')" class="flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-200/50 transition">Safe</button>' +
                     '<button id="f-nsfw" onclick="App.setFilter(\\'nsfw\\')" class="flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-200/50 transition">Adult</button>' +
                  '</div>' +
                  '<div class="flex items-center justify-between w-full sm:w-auto gap-4">' +
                      '<div class="text-xs font-medium text-zinc-500"><span id="selCount" class="text-zinc-900 font-bold">0</span> Selected</div>' +
                      '<button id="refreshBtn" onclick="App.refreshPlugins()" class="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg> Refresh</button>' +
                  '</div>' +
                '</div>' +
                '<div id="extGrid" class="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-8 w-full"></div>' +
            '</div>',

          settings: () => 
            '<div class="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">' +
                '<div class="flex-1 card p-5 sm:p-6">' +
                    '<h2 class="font-bold text-lg text-zinc-900 mb-0.5">Profile</h2>' +
                    '<p class="text-xs text-zinc-500 mb-4">Current User: <span id="currentUsr" class="font-medium text-zinc-900"></span></p>' +
                    '<div class="space-y-3 mb-4">' +
                        '<div><label class="text-xs font-medium text-zinc-700 mb-1 block">New Username</label><input id="newUsr" class="w-full input-field px-3 py-2 text-xs" placeholder="Optional"></div>' +
                        '<div><label class="text-xs font-medium text-zinc-700 mb-1 block">New Password</label><input id="newPwd" type="password" class="w-full input-field px-3 py-2 text-xs" placeholder="Optional"></div>' +
                    '</div>' +
                    '<button onclick="App.updateCredentials()" class="btn-primary px-4 py-2 text-xs w-full sm:w-auto">Save Changes</button>' +
                '</div>' +
                '<div class="flex-1 card p-5 sm:p-6">' +
                    '<h2 class="font-bold text-lg text-zinc-900 mb-0.5">Custom Sources</h2>' +
                    '<p class="text-xs text-zinc-500 mb-4">Add external plugins.json URLs.</p>' +
                    '<div class="flex gap-2 mb-3"><input id="newSrc" class="flex-1 input-field px-3 py-2 text-xs font-mono" placeholder="https://..."><button onclick="App.addSource()" class="btn-secondary px-4 py-2 text-xs">Add</button></div>' +
                    '<div id="sourceList" class="max-h-48 overflow-y-auto pr-1 border-t border-zinc-100 mt-2"></div>' +
                '</div>' +
            '</div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;
