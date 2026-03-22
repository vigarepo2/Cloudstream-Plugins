export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Aether | CloudStream Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #0f172a; --card: rgba(30, 41, 59, 0.7); --accent: #6366f1; }
        body { font-family: 'Outfit', sans-serif; background-color: var(--bg); color: #f8fafc; -webkit-tap-highlight-color: transparent; min-height: 100vh; background-image: radial-gradient(circle at top right, #1e1b4b, #0f172a 40%); }
        
        /* Glassmorphism Classes */
        .glass-panel { background: var(--card); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
        .glass-input { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.3s ease; }
        .glass-input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); outline: none; }
        
        /* Premium Buttons */
        .btn-primary { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
        .btn-primary:active { transform: scale(0.97); }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6); }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }

        /* Toasts */
        #toast-zone { position: fixed; bottom: 24px; right: 24px; z-index: 100; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast { background: rgba(15, 23, 42, 0.95); border-left: 4px solid var(--accent); backdrop-filter: blur(10px); color: white; padding: 14px 24px; border-radius: 8px; font-weight: 500; font-size: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .toast.error { border-left-color: #ef4444; }
        @keyframes slideIn { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }

        /* Top Nav Links */
        .nav-link { color: #94a3b8; font-weight: 600; transition: all 0.2s; padding: 8px 16px; border-radius: 12px; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .nav-link:hover { color: white; background: rgba(255,255,255,0.05); }
        .nav-link.active { color: white; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99,102,241,0.3); }

        /* Toggle Switch (Modern Cyber) */
        .cyber-switch { position: relative; display: inline-block; width: 36px; height: 20px; }
        .cyber-switch input { opacity: 0; width: 0; height: 0; }
        .cyber-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .3s; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); }
        .cyber-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: #94a3b8; transition: .3s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 50%; }
        input:checked + .cyber-slider { background-color: rgba(99, 102, 241, 0.2); border-color: #6366f1; }
        input:checked + .cyber-slider:before { transform: translateX(16px); background-color: #8b5cf6; box-shadow: 0 0 10px #8b5cf6; }

        .loader { border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; width: 24px; height: 24px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Plugin Card Selection Glow */
        .plugin-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .plugin-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.2); }
        .plugin-card.selected { background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05)); border-color: #6366f1; box-shadow: 0 0 15px rgba(99, 102, 241, 0.15) inset; }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="glass-panel sticky top-0 z-40 hidden border-b-0 border-t-0 border-l-0 border-r-0 border-b-[1px] border-white/10">
        <div class="max-w-[100rem] mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <div>
                    <span class="font-bold text-xl tracking-tight text-white block leading-none">Aether Hub</span>
                    <span id="syncTag" class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hidden transition-opacity">Syncing...</span>
                </div>
            </div>
            
            <div class="hidden md:flex gap-2 items-center">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Hub</a>
                <a onclick="App.navigate('/plugins')" id="nav-/plugins" class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg> Extensions</a>
                <a onclick="App.navigate('/settings')" id="nav-/settings" class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Settings</a>
                
                <div class="w-px h-6 bg-white/10 mx-2"></div>
                <a onclick="App.logout()" class="nav-link hover:!text-red-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Disconnect</a>
            </div>
            
            <button class="md:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </div>
        
        <div id="mobileMenu" class="hidden md:hidden absolute w-full glass-panel border-t border-white/10 px-4 py-4 space-y-2 mt-1 shadow-2xl">
            <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-white font-semibold p-4 rounded-xl bg-white/5 border border-white/5">Dashboard</a>
            <a onclick="App.navigate('/plugins'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-white font-semibold p-4 rounded-xl bg-white/5 border border-white/5">Extensions</a>
            <a onclick="App.navigate('/settings'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-white font-semibold p-4 rounded-xl bg-white/5 border border-white/5">Settings</a>
            <a onclick="App.logout()" class="block text-red-400 font-semibold p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center mt-4">Disconnect</a>
        </div>
    </nav>

    <main id="app-root" class="max-w-[100rem] mx-auto px-4 md:px-8 py-8"></main>

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
          t.innerHTML = \`<div class="flex items-center gap-3"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="\${isError ? 'text-red-400' : 'text-indigo-400'}"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> \${msg}</div>\`;
          zone.appendChild(t);
          setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
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
          App.token = null; App.user = null;
          App.navigate('/login');
        },

        handleAuth: async (action) => {
          const u = document.getElementById('usr').value;
          const p = document.getElementById('pwd').value;
          if (!u || !p) return App.notify('Credentials required', true);
          
          const btn = document.getElementById('authBtn');
          const oldTxt = btn.innerText;
          btn.innerHTML = '<div class="loader"></div>';
          
          try {
            const res = await App.api('/api/auth', 'POST', { action, username: u, password: p });
            localStorage.setItem('cs_session', res.token);
            localStorage.setItem('cs_user', res.username);
            App.token = res.token; App.user = res.username;
            App.notify('System Accessed');
            App.navigate('/dashboard');
          } catch (e) {
            btn.innerHTML = oldTxt;
            App.notify(e.error || 'Authentication failed', true);
          }
        },

        // Backend logic calls here (loadDashboard, updateCredentials, etc. remain logically same)
        loadDashboard: () => {
            const base = window.location.origin;
            document.getElementById('def-all').value = base + '/' + App.user + '/all/repo.json';
            document.getElementById('def-movies').value = base + '/' + App.user + '/sfw/repo.json';
            document.getElementById('def-adult').value = base + '/' + App.user + '/nsfw/repo.json';
        },

        loadPlugins: async () => {
            try {
                const me = await App.api('/api/me');
                App.selected = new Set(me.selected);
                App.customSources = me.sources;
                
                App.extData = await App.api('/api/plugins');
                App.renderExtGrid();
            } catch (e) { App.notify('Failed to load plugins', true); }
        },

        refreshPlugins: async () => {
            const btn = document.getElementById('refreshBtn');
            btn.innerHTML = '<div class="loader !w-4 !h-4 !border-2"></div>';
            App.notify('Syncing with global repositories...');
            
            try {
                App.extData = await App.api('/api/plugins/refresh', 'POST');
                App.renderExtGrid();
                App.notify('Repositories synced successfully!');
            } catch (e) { App.notify('Failed to sync', true); }
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> Sync Now';
        },

        saveSelections: () => {
            document.getElementById('syncTag').classList.remove('hidden');
            clearTimeout(App.saveTimer);
            App.saveTimer = setTimeout(async () => {
                try {
                    await App.api('/api/me/plugins', 'POST', { selected: Array.from(App.selected), sources: App.customSources });
                    setTimeout(() => document.getElementById('syncTag').classList.add('hidden'), 1000);
                } catch (e) { App.notify('Auto-save failed', true); }
            }, 1000);
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
                    btn.className = "px-5 py-2 rounded-lg text-sm font-bold bg-white/10 text-white shadow-inner border border-white/10"; 
                } else { 
                    btn.className = "px-5 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white transition"; 
                }
            });
            App.renderExtGrid();
        },

        // HIGH DENSITY GRID RENDER
        renderExtGrid: () => {
            const grid = document.getElementById('extGrid');
            if (!App.extData) return;

            let html = '';
            App.extData.forEach(p => {
                if (App.filterType === 'sfw' && p.isAdult) return;
                if (App.filterType === 'nsfw' && !p.isAdult) return;

                const isSelected = App.selected.has(p.internalName);
                const img = p.iconUrl || p.icon ? \`<img src="\${p.iconUrl || p.icon}" class="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-white/5 shadow-md shrink-0">\` : \`<div class="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-[10px] font-bold border border-white/5 shadow-md shrink-0">N/A</div>\`;
                
                let tags = '';
                if(p.isAdult) tags += '<span class="text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">NSFW</span> ';
                tags += \`<span class="text-slate-400 bg-slate-800/50 border border-white/5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">\${p.language || 'EN'}</span> \`;
                tags += \`<span class="text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">v\${p.version || 1}</span>\`;

                html += \`
                <div class="glass-panel rounded-2xl p-4 plugin-card cursor-pointer select-none flex flex-col justify-between \${isSelected ? 'selected' : ''}" onclick="App.togglePlugin('\${p.internalName}')">
                    <div class="flex items-start justify-between mb-3 gap-3">
                        \${img}
                        <label class="cyber-switch shrink-0 pointer-events-none mt-1">
                            <input type="checkbox" \${isSelected ? 'checked' : ''}><span class="cyber-slider"></span>
                        </label>
                    </div>
                    <div>
                        <h3 class="font-bold text-white text-sm truncate" title="\${p.name}">\${p.name}</h3>
                        <p class="text-[11px] text-slate-400 font-medium truncate mb-3">\${Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'Community')}</p>
                        <div class="flex flex-wrap gap-1.5 mt-auto">
                            \${tags}
                        </div>
                    </div>
                </div>\`;
            });
            grid.innerHTML = html || '<div class="col-span-full text-center text-slate-500 py-20 font-bold text-lg">No extensions match your criteria.</div>';
            document.getElementById('selCount').innerText = App.selected.size;
        },

        addSource: () => {
            const input = document.getElementById('newSrc');
            const val = input.value.trim();
            if(!val.startsWith('http')) return App.notify('Invalid JSON URL', true);
            App.customSources.push(val);
            input.value = '';
            App.saveSelections();
            App.renderSources();
        },

        removeSource: (index) => {
            App.customSources.splice(index, 1);
            App.saveSelections();
            App.renderSources();
        },

        loadSettings: async () => {
            try {
                document.getElementById('currentUsr').innerText = App.user;
                const me = await App.api('/api/me');
                App.customSources = me.sources;
                App.renderSources();
            } catch (e) {}
        },

        updateCredentials: async () => {
            const u = document.getElementById('newUsr').value;
            const p = document.getElementById('newPwd').value;
            if (!u && !p) return App.notify('Enter new details', true);
            try {
                const res = await App.api('/api/me/credentials', 'PUT', { username: u, password: p });
                if(res.username) { localStorage.setItem('cs_user', res.username); App.user = res.username; }
                App.notify('Security Updated');
                document.getElementById('newUsr').value = ''; document.getElementById('newPwd').value = '';
                App.loadSettings();
            } catch (e) { App.notify(e.error, true); }
        },

        renderSources: () => {
            const list = document.getElementById('sourceList');
            if(!list) return;
            list.innerHTML = App.customSources.map((s, i) => \`
                <div class="flex justify-between items-center bg-slate-800/50 border border-white/5 p-3 rounded-xl mb-2">
                    <span class="text-[11px] font-mono text-slate-300 truncate mr-3">\${s}</span>
                    <button onclick="App.removeSource(\${i})" class="text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition text-xs font-bold">Del</button>
                </div>
            \`).join('') || '<p class="text-xs text-slate-500 font-bold uppercase py-4 text-center">No External Repositories</p>';
        },

        copy: (id) => {
            const el = document.getElementById(id);
            navigator.clipboard.writeText(el.value);
            App.notify('Link Copied to Clipboard!');
        },

        views: {
          login: () => 
            '<div class="min-h-[80vh] flex items-center justify-center"><div class="max-w-md w-full px-4"><div class="text-center mb-10"><div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/40"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div><h1 class="text-4xl font-extrabold tracking-tight text-white mb-2">Aether</h1><p class="text-slate-400 font-medium">Your Personal Extension Cloud</p></div>' +
            '<div class="glass-panel p-8 rounded-[32px] space-y-5">' +
            '<div><label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Username</label><input id="usr" class="w-full glass-input px-5 py-3.5 rounded-2xl text-sm font-semibold" placeholder="Enter identity"></div>' +
            '<div><label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Password</label><input id="pwd" type="password" class="w-full glass-input px-5 py-3.5 rounded-2xl text-sm font-semibold" placeholder="••••••••"></div>' +
            '<div class="pt-4"><button id="authBtn" onclick="App.handleAuth(\\'login\\')" class="w-full btn-primary py-4 rounded-2xl text-sm font-bold tracking-wide">INITIALIZE SECURE LINK</button></div>' +
            '<button onclick="App.navigate(\\'/signup\\')" class="w-full text-slate-400 font-semibold py-3 text-sm mt-2 hover:text-white transition">Deploy New Hub?</button></div></div></div>',
            
          signup: () => 
            '<div class="min-h-[80vh] flex items-center justify-center"><div class="max-w-md w-full px-4"><div class="text-center mb-8"><h1 class="text-3xl font-extrabold tracking-tight text-white">Deploy Hub</h1><p class="text-slate-400 font-medium mt-2">Initialize your private instance</p></div>' +
            '<div class="glass-panel p-8 rounded-[32px] space-y-5">' +
            '<div><label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Choose Username</label><input id="usr" class="w-full glass-input px-5 py-3.5 rounded-2xl text-sm font-semibold" placeholder="e.g. admin"></div>' +
            '<div><label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Master Password</label><input id="pwd" type="password" class="w-full glass-input px-5 py-3.5 rounded-2xl text-sm font-semibold" placeholder="Create strong key"></div>' +
            '<div class="pt-4"><button id="authBtn" onclick="App.handleAuth(\\'signup\\')" class="w-full btn-primary py-4 rounded-2xl text-sm font-bold tracking-wide">DEPLOY INSTANCE</button></div>' +
            '<button onclick="App.navigate(\\'/login\\')" class="w-full text-slate-400 font-semibold py-3 text-sm mt-2 hover:text-white transition">Back to Login</button></div></div></div>',

          dashboard: () => 
            '<div class="max-w-3xl mx-auto mt-6"><div class="mb-10 text-center"><h1 class="text-4xl font-extrabold text-white mb-3">Sync Nodes</h1><p class="text-slate-400">Copy these endpoints into your client application.</p></div>' +
            '<div class="space-y-5">' +
            '<div class="glass-panel p-6 rounded-[24px] relative overflow-hidden group"><div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div><div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4 relative z-10"><div class="flex-1"><span class="font-bold text-indigo-400 text-xs uppercase tracking-widest flex items-center gap-2 mb-2"><div class="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></div> Master Bundle</span><h3 class="text-xl font-bold text-white mb-4">All Extensions</h3><input id="def-all" readonly class="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono outline-none"></div><button onclick="App.copy(\\'def-all\\')" class="bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20 shrink-0">Copy Node</button></div></div>' +
            '<div class="glass-panel p-6 rounded-[24px] relative overflow-hidden group"><div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div><div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4 relative z-10"><div class="flex-1"><span class="font-bold text-emerald-400 text-xs uppercase tracking-widest flex items-center gap-2 mb-2"><div class="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div> SFW Only</span><h3 class="text-xl font-bold text-white mb-4">Safe Content Hub</h3><input id="def-movies" readonly class="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono outline-none"></div><button onclick="App.copy(\\'def-movies\\')" class="bg-slate-800 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition shrink-0">Copy Node</button></div></div>' +
            '<div class="glass-panel p-6 rounded-[24px] relative overflow-hidden group"><div class="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div><div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4 relative z-10"><div class="flex-1"><span class="font-bold text-red-400 text-xs uppercase tracking-widest flex items-center gap-2 mb-2"><div class="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></div> NSFW Alert</span><h3 class="text-xl font-bold text-white mb-4">Adult Content (18+)</h3><input id="def-adult" readonly class="w-full bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300 font-mono outline-none"></div><button onclick="App.copy(\\'def-adult\\')" class="bg-slate-800 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition shrink-0">Copy Node</button></div></div>' +
            '</div></div>',
            
          plugins: () =>
            '<div class="flex flex-col mb-6">' +
                '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-2 rounded-[20px] mb-6">' +
                  '<div class="flex gap-1 bg-slate-900/50 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto">' +
                     '<button id="f-all" onclick="App.setFilter(\\'all\\')" class="px-5 py-2 rounded-xl text-sm font-bold bg-white/10 text-white shadow-inner border border-white/10 shrink-0">Global Library</button>' +
                     '<button id="f-sfw" onclick="App.setFilter(\\'sfw\\')" class="px-5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition shrink-0">Safe Config</button>' +
                     '<button id="f-nsfw" onclick="App.setFilter(\\'nsfw\\')" class="px-5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition shrink-0">Adult Config</button>' +
                  '</div>' +
                  '<div class="flex items-center gap-4 px-3 w-full sm:w-auto">' +
                      '<div class="text-right"><div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</div><div id="selCount" class="text-xl font-bold text-indigo-400 leading-none mt-1">0</div></div>' +
                      '<div class="w-px h-8 bg-white/10"></div>' +
                      '<button id="refreshBtn" onclick="App.refreshPlugins()" class="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-500/20 transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> Sync Now</button>' +
                  '</div>' +
                '</div>' +
                
                // ULTRA HIGH DENSITY RESPONSIVE GRID
                '<div id="extGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-10"></div>' +
            '</div>',

          settings: () => 
            '<div class="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">' +
                // Credentials Box
                '<div class="flex-1 glass-panel p-8 rounded-[32px]">' +
                    '<div class="flex items-center gap-3 mb-6"><div class="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div><h2 class="font-bold text-2xl text-white">Access Control</h2></div>' +
                    '<p class="text-sm text-slate-400 mb-6">Current Identity: <span id="currentUsr" class="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md"></span></p>' +
                    '<div class="space-y-5 mb-8">' +
                        '<div><label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Update Identity</label><input id="newUsr" class="w-full glass-input px-5 py-3.5 rounded-2xl text-sm font-medium" placeholder="Leave blank to keep current"></div>' +
                        '<div><label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Update Key</label><input id="newPwd" type="password" class="w-full glass-input px-5 py-3.5 rounded-2xl text-sm font-medium" placeholder="Leave blank to keep current"></div>' +
                    '</div>' +
                    '<button onclick="App.updateCredentials()" class="btn-primary px-8 py-3.5 rounded-2xl text-sm font-bold w-full sm:w-auto">Update Security</button>' +
                '</div>' +
                // External Sources Box
                '<div class="flex-1 glass-panel p-8 rounded-[32px]">' +
                    '<div class="flex items-center gap-3 mb-6"><div class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg></div><h2 class="font-bold text-2xl text-white">External Repos</h2></div>' +
                    '<p class="text-sm text-slate-400 mb-6">Inject custom plugins.json links to expand your ecosystem.</p>' +
                    '<div class="flex gap-2 mb-6"><input id="newSrc" class="flex-1 glass-input px-4 py-3 rounded-xl text-[12px] font-mono" placeholder="https://.../plugins.json"><button onclick="App.addSource()" class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition">Inject</button></div>' +
                    '<div class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Active Injections</div>' +
                    '<div id="sourceList" class="max-h-60 overflow-y-auto space-y-2 pr-2"></div>' +
                '</div>' +
            '</div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;
