export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CloudStream Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #fafafa; color: #111827; -webkit-tap-highlight-color: transparent; }
        
        /* Minimalist UI Elements */
        .card-minimal { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); transition: all 0.2s ease; }
        .card-minimal:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .input-minimal { background: #ffffff; border: 1px solid #d1d5db; color: #111827; transition: all 0.2s ease; border-radius: 10px; }
        .input-minimal:focus { border-color: #000000; box-shadow: 0 0 0 1px #000000; outline: none; }
        
        /* Standard Buttons */
        .btn-primary { background: #111827; color: #ffffff; border-radius: 10px; font-weight: 500; transition: background 0.2s ease; }
        .btn-primary:hover { background: #374151; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-secondary { background: #f3f4f6; color: #374151; border-radius: 10px; font-weight: 500; transition: background 0.2s ease; border: 1px solid #e5e7eb; }
        .btn-secondary:hover { background: #e5e7eb; }

        /* Clean Scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

        /* Minimalist Toasts */
        #toast-zone { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
        .toast { background: #111827; color: #ffffff; padding: 12px 20px; border-radius: 100px; font-weight: 500; font-size: 14px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s ease forwards; display: flex; align-items: center; gap: 8px; }
        .toast.error { background: #ef4444; }
        @keyframes slideUp { 0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }

        /* Nav Links */
        .nav-link { color: #6b7280; font-weight: 500; transition: color 0.2s; padding: 6px 12px; border-radius: 8px; font-size: 14px; cursor: pointer; }
        .nav-link:hover { color: #111827; background: #f3f4f6; }
        .nav-link.active { color: #111827; font-weight: 600; background: #f3f4f6; }

        /* Simple iOS style toggle */
        .toggle-switch { position: relative; display: inline-block; width: 40px; height: 24px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e5e7eb; transition: .2s; border-radius: 24px; }
        .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        input:checked + .toggle-slider { background-color: #111827; }
        input:checked + .toggle-slider:before { transform: translateX(16px); }

        .loader { border: 2px solid #e5e7eb; border-top-color: #111827; border-radius: 50%; width: 20px; height: 20px; animation: spin 0.6s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Selection state */
        .plugin-card.selected { border-color: #111827; box-shadow: 0 0 0 1px #111827; }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="bg-white border-b border-gray-200 sticky top-0 z-40 hidden">
        <div class="max-w-[100rem] mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="font-bold text-lg tracking-tight text-gray-900">CloudStream Hub</span>
                <span id="syncTag" class="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hidden">Saving...</span>
            </div>
            
            <div class="hidden md:flex gap-1 items-center">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link">Dashboard</a>
                <a onclick="App.navigate('/plugins')" id="nav-/plugins" class="nav-link">Extensions</a>
                <a onclick="App.navigate('/settings')" id="nav-/settings" class="nav-link">Settings</a>
                <div class="w-px h-5 bg-gray-300 mx-3"></div>
                <a onclick="App.logout()" class="nav-link text-red-600 hover:text-red-700 hover:bg-red-50">Log Out</a>
            </div>
            
            <button class="md:hidden p-2 text-gray-600" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </div>
        
        <div id="mobileMenu" class="hidden md:hidden absolute w-full bg-white border-b border-gray-200 px-4 py-2 space-y-1 shadow-sm">
            <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-gray-700 font-medium p-3 rounded-lg hover:bg-gray-50">Dashboard</a>
            <a onclick="App.navigate('/plugins'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-gray-700 font-medium p-3 rounded-lg hover:bg-gray-50">Extensions</a>
            <a onclick="App.navigate('/settings'); document.getElementById('mobileMenu').classList.add('hidden')" class="block text-gray-700 font-medium p-3 rounded-lg hover:bg-gray-50">Settings</a>
            <a onclick="App.logout()" class="block text-red-600 font-medium p-3 rounded-lg hover:bg-red-50 mt-2 border-t border-gray-100">Log Out</a>
        </div>
    </nav>

    <main id="app-root" class="max-w-[100rem] mx-auto px-4 md:px-8 py-10"></main>

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
          setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
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
          btn.innerHTML = '<div class="loader !border-gray-400 !border-t-white"></div>';
          
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

        loadPlugins: async () => {
            try {
                const me = await App.api('/api/me');
                App.selected = new Set(me.selected);
                App.customSources = me.sources;
                
                App.extData = await App.api('/api/plugins');
                App.renderExtGrid();
            } catch (e) { App.notify('Failed to load extensions', true); }
        },

        refreshPlugins: async () => {
            const btn = document.getElementById('refreshBtn');
            btn.innerHTML = '<div class="loader !w-4 !h-4 !border-gray-400 !border-t-gray-900"></div>';
            
            try {
                App.extData = await App.api('/api/plugins/refresh', 'POST');
                App.renderExtGrid();
                App.notify('Extensions synced successfully');
            } catch (e) { App.notify('Failed to sync', true); }
            btn.innerHTML = 'Refresh Data';
        },

        saveSelections: () => {
            document.getElementById('syncTag').classList.remove('hidden');
            clearTimeout(App.saveTimer);
            App.saveTimer = setTimeout(async () => {
                try {
                    await App.api('/api/me/plugins', 'POST', { selected: Array.from(App.selected), sources: App.customSources });
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
                    btn.className = "px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white"; 
                } else { 
                    btn.className = "px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"; 
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
                const img = p.iconUrl || p.icon ? \`<img src="\${p.iconUrl || p.icon}" class="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0">\` : \`<div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-medium border border-gray-200 shrink-0">N/A</div>\`;
                
                let badge = p.isAdult 
                    ? '<span class="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px] font-medium">18+ Adult</span>' 
                    : '';

                html += \`
                <div class="card-minimal p-4 plugin-card cursor-pointer select-none flex flex-col justify-between \${isSelected ? 'selected bg-gray-50' : ''}" onclick="App.togglePlugin('\${p.internalName}')">
                    <div class="flex items-start justify-between mb-3 gap-3">
                        <div class="flex gap-3 items-center">
                            \${img}
                            <div>
                                <h3 class="font-semibold text-gray-900 text-sm leading-tight line-clamp-1" title="\${p.name}">\${p.name}</h3>
                                <p class="text-[12px] text-gray-500 font-medium truncate">\${Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'Community')}</p>
                            </div>
                        </div>
                        <label class="toggle-switch shrink-0 pointer-events-none">
                            <input type="checkbox" \${isSelected ? 'checked' : ''}><span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 mt-2">
                        \${badge}
                        <span class="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium border border-gray-200">\${p.language || 'EN'}</span>
                        <span class="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium border border-gray-200">v\${p.version || 1}</span>
                    </div>
                </div>\`;
            });
            grid.innerHTML = html || '<div class="col-span-full text-center text-gray-500 py-20 font-medium">No extensions found.</div>';
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
                const me = await App.api('/api/me');
                App.customSources = me.sources;
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
                <div class="flex justify-between items-center border-b border-gray-100 py-3 last:border-0">
                    <span class="text-sm font-mono text-gray-600 truncate pr-4">\${s}</span>
                    <button onclick="App.removeSource(\${i})" class="text-red-600 text-sm font-medium hover:text-red-800 transition">Remove</button>
                </div>
            \`).join('') || '<p class="text-sm text-gray-500 py-4">No custom sources added yet.</p>';
        },

        copy: (id) => {
            const el = document.getElementById(id);
            navigator.clipboard.writeText(el.value);
            App.notify('Link copied to clipboard');
        },

        views: {
          login: () => 
            '<div class="min-h-[75vh] flex items-center justify-center"><div class="max-w-sm w-full"><div class="text-center mb-8"><h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-2">Welcome Back</h1><p class="text-gray-500 text-sm">Sign in to manage your extensions</p></div>' +
            '<div class="card-minimal p-6 sm:p-8 space-y-4">' +
            '<div><label class="text-sm font-medium text-gray-700 mb-1.5 block">Username</label><input id="usr" class="w-full input-minimal px-4 py-2.5 text-sm" placeholder="Enter username"></div>' +
            '<div><label class="text-sm font-medium text-gray-700 mb-1.5 block">Password</label><input id="pwd" type="password" class="w-full input-minimal px-4 py-2.5 text-sm" placeholder="••••••••"></div>' +
            '<div class="pt-2"><button id="authBtn" onclick="App.handleAuth(\\'login\\')" class="w-full btn-primary py-2.5 text-sm">Log In</button></div>' +
            '<div class="text-center mt-4"><button onclick="App.navigate(\\'/signup\\')" class="text-sm text-gray-500 hover:text-gray-900 font-medium transition">Create an account</button></div></div></div></div>',
            
          signup: () => 
            '<div class="min-h-[75vh] flex items-center justify-center"><div class="max-w-sm w-full"><div class="text-center mb-8"><h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-2">Create Account</h1><p class="text-gray-500 text-sm">Set up your personal workspace</p></div>' +
            '<div class="card-minimal p-6 sm:p-8 space-y-4">' +
            '<div><label class="text-sm font-medium text-gray-700 mb-1.5 block">Username</label><input id="usr" class="w-full input-minimal px-4 py-2.5 text-sm" placeholder="Choose a username"></div>' +
            '<div><label class="text-sm font-medium text-gray-700 mb-1.5 block">Password</label><input id="pwd" type="password" class="w-full input-minimal px-4 py-2.5 text-sm" placeholder="Create a password"></div>' +
            '<div class="pt-2"><button id="authBtn" onclick="App.handleAuth(\\'signup\\')" class="w-full btn-primary py-2.5 text-sm">Sign Up</button></div>' +
            '<div class="text-center mt-4"><button onclick="App.navigate(\\'/login\\')" class="text-sm text-gray-500 hover:text-gray-900 font-medium transition">Already have an account? Log in</button></div></div></div></div>',

          dashboard: () => 
            '<div class="max-w-3xl mx-auto"><div class="mb-8"><h1 class="text-2xl font-bold text-gray-900 mb-2">Dashboard Links</h1><p class="text-gray-600 text-sm">Copy these URLs into the app to sync your selected extensions.</p></div>' +
            '<div class="space-y-4">' +
            '<div class="card-minimal p-5 sm:p-6"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3"><h3 class="text-base font-semibold text-gray-900">All Extensions</h3><button onclick="App.copy(\\'def-all\\')" class="btn-secondary px-4 py-2 text-sm shrink-0">Copy Link</button></div><input id="def-all" readonly class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 font-mono outline-none"></div>' +
            '<div class="card-minimal p-5 sm:p-6"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3"><h3 class="text-base font-semibold text-gray-900">Safe Content Only</h3><button onclick="App.copy(\\'def-movies\\')" class="btn-secondary px-4 py-2 text-sm shrink-0">Copy Link</button></div><input id="def-movies" readonly class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 font-mono outline-none"></div>' +
            '<div class="card-minimal p-5 sm:p-6"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3"><h3 class="text-base font-semibold text-red-600">Adult Content (18+)</h3><button onclick="App.copy(\\'def-adult\\')" class="btn-secondary px-4 py-2 text-sm shrink-0">Copy Link</button></div><input id="def-adult" readonly class="w-full bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-sm text-red-700 font-mono outline-none"></div>' +
            '</div></div>',
            
          plugins: () =>
            '<div class="flex flex-col">' +
                '<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">' +
                  '<div class="flex gap-1 bg-gray-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto border border-gray-200">' +
                     '<button id="f-all" onclick="App.setFilter(\\'all\\')" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white shrink-0">All</button>' +
                     '<button id="f-sfw" onclick="App.setFilter(\\'sfw\\')" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition shrink-0">Safe Content</button>' +
                     '<button id="f-nsfw" onclick="App.setFilter(\\'nsfw\\')" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition shrink-0">Adult (18+)</button>' +
                  '</div>' +
                  '<div class="flex items-center gap-4 w-full md:w-auto">' +
                      '<div class="text-sm font-medium text-gray-600"><span id="selCount" class="text-gray-900 font-bold">0</span> Selected</div>' +
                      '<div class="w-px h-6 bg-gray-300"></div>' +
                      '<button id="refreshBtn" onclick="App.refreshPlugins()" class="btn-secondary px-4 py-2 text-sm font-medium">Refresh Data</button>' +
                  '</div>' +
                '</div>' +
                '<div id="extGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-10"></div>' +
            '</div>',

          settings: () => 
            '<div class="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">' +
                '<div class="flex-1 card-minimal p-6 sm:p-8">' +
                    '<h2 class="font-bold text-xl text-gray-900 mb-1">Profile</h2>' +
                    '<p class="text-sm text-gray-500 mb-6">Current User: <span id="currentUsr" class="font-medium text-gray-900"></span></p>' +
                    '<div class="space-y-4 mb-6">' +
                        '<div><label class="text-sm font-medium text-gray-700 mb-1.5 block">New Username</label><input id="newUsr" class="w-full input-minimal px-4 py-2.5 text-sm" placeholder="Optional"></div>' +
                        '<div><label class="text-sm font-medium text-gray-700 mb-1.5 block">New Password</label><input id="newPwd" type="password" class="w-full input-minimal px-4 py-2.5 text-sm" placeholder="Optional"></div>' +
                    '</div>' +
                    '<button onclick="App.updateCredentials()" class="btn-primary px-5 py-2.5 text-sm w-full sm:w-auto">Save Changes</button>' +
                '</div>' +
                '<div class="flex-1 card-minimal p-6 sm:p-8">' +
                    '<h2 class="font-bold text-xl text-gray-900 mb-1">Custom Sources</h2>' +
                    '<p class="text-sm text-gray-500 mb-6">Add external plugins.json URLs.</p>' +
                    '<div class="flex gap-2 mb-4"><input id="newSrc" class="flex-1 input-minimal px-4 py-2.5 text-sm font-mono" placeholder="https://..."><button onclick="App.addSource()" class="btn-secondary px-5 py-2.5 text-sm">Add</button></div>' +
                    '<div id="sourceList" class="max-h-60 overflow-y-auto pr-2 border-t border-gray-100 mt-4"></div>' +
                '</div>' +
            '</div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;
