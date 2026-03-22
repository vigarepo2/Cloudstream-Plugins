export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>My CloudStream</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; color: #0f172a; -webkit-tap-highlight-color: transparent; }
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

        .nav-link { color: #64748b; font-weight: 700; transition: color 0.2s; padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; }
        .nav-link:hover { color: #0f172a; background: #f1f5f9; }
        .nav-link.active { color: #2563eb; background: #dbeafe; }
        
        .loader { border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; width: 22px; height: 22px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        .spin-fast { animation: spin 0.5s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Smooth Custom Checkbox */
        .custom-checkbox { display: flex; align-items: center; cursor: pointer; }
        .custom-checkbox input { display: none; }
        .checkmark { width: 22px; height: 22px; background-color: #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .custom-checkbox input:checked + .checkmark { background-color: #2563eb; }
        .checkmark svg { width: 14px; height: 14px; fill: none; stroke: white; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; opacity: 0; transition: 0.2s; transform: scale(0.5); }
        .custom-checkbox input:checked + .checkmark svg { opacity: 1; transform: scale(1); }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="bg-white border-b border-gray-200 sticky top-0 z-40 hidden">
        <div class="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <span class="font-extrabold text-xl tracking-tight hidden sm:block">My CS</span>
                <span id="syncTag" class="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-1 rounded uppercase tracking-wider hidden ml-2">Saving...</span>
            </div>
            <div class="hidden md:flex gap-2 items-center">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Home</a>
                <a onclick="App.navigate('/plugins')" id="nav-/plugins" class="nav-link"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Plugins</a>
                <a onclick="App.navigate('/settings')" id="nav-/settings" class="nav-link"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Settings</a>
                <div class="w-px h-5 bg-gray-300 mx-2"></div>
                <a onclick="App.logout()" class="nav-link text-red-500 hover:text-red-600 hover:bg-red-50"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Out</a>
            </div>
            <button class="md:hidden p-2 text-gray-600 bg-gray-100 rounded-lg" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </div>
        <div id="mobileMenu" class="hidden md:hidden border-t border-gray-100 bg-gray-50 p-4 space-y-2 shadow-inner">
            <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Dashboard</a>
            <a onclick="App.navigate('/plugins'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Manage Plugins</a>
            <a onclick="App.navigate('/settings'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Settings</a>
            <a onclick="App.logout()" class="block font-bold text-red-600 p-3 bg-red-50 rounded-xl mt-4 flex items-center gap-3"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Log Out</a>
        </div>
    </nav>

    <main id="app-root" class="max-w-6xl mx-auto px-4 py-8"></main>

    <script>
      const App = {
        token: localStorage.getItem('cs_session'),
        user: localStorage.getItem('cs_user'),
        extData: null,
        selected: new Set(),
        customSources: [],
        searchQuery: '',
        filterType: 'all',
        saveTimer: null,

        notify: (msg, isError = false) => {
          const zone = document.getElementById('toast-zone');
          const t = document.createElement('div');
          t.className = 'toast' + (isError ? ' error' : ''); t.innerText = msg;
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
              if(!err.error) throw {error: "Connection Failed"};
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
          if (!u || !p) return App.notify('Both fields required', true);
          
          const btn = document.getElementById('authBtn');
          const oldTxt = btn.innerText;
          btn.innerHTML = '<div class="loader !border-white !border-t-transparent"></div>';
          
          try {
            const res = await App.api('/api/auth', 'POST', { action, username: u, password: p });
            localStorage.setItem('cs_session', res.token);
            localStorage.setItem('cs_user', res.username);
            App.token = res.token; App.user = res.username;
            App.notify('Access Granted');
            App.navigate('/dashboard');
          } catch (e) {
            btn.innerHTML = oldTxt;
            if(e.error === 'wrong_password') document.getElementById('pwd').value = '';
            App.notify(e.error || 'Auth failed', true);
          }
        },

        updateCredentials: async () => {
            const u = document.getElementById('newUsr').value;
            const p = document.getElementById('newPwd').value;
            if (!u && !p) return App.notify('Enter a new username or password', true);
            
            try {
                const res = await App.api('/api/me/credentials', 'PUT', { username: u, password: p });
                if(res.username) {
                    localStorage.setItem('cs_user', res.username);
                    App.user = res.username;
                }
                App.notify('Credentials updated!');
                document.getElementById('newUsr').value = '';
                document.getElementById('newPwd').value = '';
                App.loadSettings();
            } catch (e) {
                App.notify(e.error || 'Update failed', true);
            }
        },

        loadDashboard: () => {
            const base = window.location.origin;
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
            } catch (e) {}
        },

        refreshPlugins: async () => {
            const icon = document.getElementById('refreshIcon');
            icon.classList.add('spin-fast');
            App.notify('Fetching latest plugins...');
            document.getElementById('extGrid').innerHTML = '<div class="col-span-full py-20 text-center"><div class="loader"></div></div>';
            
            try {
                App.extData = await App.api('/api/plugins/refresh', 'POST');
                App.renderExtGrid();
                App.notify('Plugins successfully synced!');
            } catch (e) {
                App.notify('Failed to sync plugins', true);
            }
            icon.classList.remove('spin-fast');
        },

        loadSettings: async () => {
            try {
                document.getElementById('currentUsr').innerText = App.user;
                const me = await App.api('/api/me');
                App.customSources = me.sources;
                App.renderSources();
            } catch (e) {}
        },

        saveSelections: () => {
            document.getElementById('syncTag').classList.remove('hidden');
            clearTimeout(App.saveTimer);
            App.saveTimer = setTimeout(async () => {
                try {
                    await App.api('/api/me/plugins', 'POST', { selected: Array.from(App.selected), sources: App.customSources });
                    setTimeout(() => document.getElementById('syncTag').classList.add('hidden'), 1000);
                } catch (e) { document.getElementById('syncTag').classList.add('hidden'); }
            }, 800);
        },

        togglePlugin: (id) => {
            if(App.selected.has(id)) App.selected.delete(id);
            else App.selected.add(id);
            App.renderExtGrid();
            App.saveSelections();
        },

        selectAll: () => {
            if(!App.extData) return;
            App.extData.forEach(p => {
                if (App.filterType === 'sfw' && p.isAdult) return;
                if (App.filterType === 'nsfw' && !p.isAdult) return;
                if (App.searchQuery && !p.name.toLowerCase().includes(App.searchQuery)) return;
                App.selected.add(p.internalName);
            });
            App.renderExtGrid();
            App.saveSelections();
        },

        deselectAll: () => {
            if(!App.extData) return;
            App.extData.forEach(p => {
                if (App.filterType === 'sfw' && p.isAdult) return;
                if (App.filterType === 'nsfw' && !p.isAdult) return;
                if (App.searchQuery && !p.name.toLowerCase().includes(App.searchQuery)) return;
                App.selected.delete(p.internalName);
            });
            App.renderExtGrid();
            App.saveSelections();
        },

        searchExt: (val) => { App.searchQuery = val.toLowerCase(); App.renderExtGrid(); },
        
        setFilter: (type) => { 
            App.filterType = type;
            ['all', 'sfw', 'nsfw'].forEach(t => {
                const btn = document.getElementById('f-' + t);
                if(t === type) { btn.classList.add('bg-gray-900', 'text-white'); btn.classList.remove('bg-gray-100', 'text-gray-600'); }
                else { btn.classList.remove('bg-gray-900', 'text-white'); btn.classList.add('bg-gray-100', 'text-gray-600'); }
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
                if (App.searchQuery && !p.name.toLowerCase().includes(App.searchQuery)) return;

                const isSelected = App.selected.has(p.internalName);
                const img = p.iconUrl || p.icon ? \`<img src="\${p.iconUrl || p.icon}" class="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-200 shrink-0">\` : \`<div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold border border-gray-200 shrink-0">N/A</div>\`;
                const badge = p.isAdult ? '<span class="text-red-700 font-extrabold border border-red-200 bg-red-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">18+ NSFW</span>' : '<span class="text-green-700 font-extrabold border border-green-200 bg-green-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">SFW</span>';
                const brokenBadge = p.isBroken ? '<span class="text-gray-500 font-extrabold border border-gray-300 bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ml-1">Broken</span>' : '';
                
                html += \`
                <div class="bg-white rounded-3xl p-4 shadow-sm border transition-all cursor-pointer \${isSelected ? 'border-blue-500 bg-blue-50/10 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}" onclick="App.togglePlugin('\${p.internalName}')">
                    <div class="flex items-center gap-3 mb-3">
                        \${img}
                        <div class="flex-1 min-w-0">
                            <h3 class="font-extrabold text-gray-900 text-sm truncate" title="\${p.name}">\${p.name}</h3>
                            <div class="flex items-center mt-1">
                                \${badge}
                                \${brokenBadge}
                            </div>
                        </div>
                        <label class="custom-checkbox shrink-0 pointer-events-none">
                            <input type="checkbox" \${isSelected ? 'checked' : ''}>
                            <div class="checkmark">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        </label>
                    </div>
                    <div class="flex flex-wrap gap-1.5 mt-auto bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <span class="text-gray-600 text-[10px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded uppercase">\${p.language || 'EN'}</span>
                        <span class="text-gray-600 text-[10px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded">v\${p.version || 1}</span>
                        <span class="text-gray-600 text-[10px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded">\${p.formattedSize}</span>
                    </div>
                </div>\`;
            });
            grid.innerHTML = html || '<div class="col-span-full text-center text-gray-500 py-10 font-bold text-base bg-white rounded-3xl shadow-sm border border-gray-100">No plugins found.</div>';
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

        renderSources: () => {
            const list = document.getElementById('sourceList');
            if(!list) return;
            list.innerHTML = App.customSources.map((s, i) => \`
                <div class="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-xl mb-2">
                    <span class="text-xs font-mono text-gray-600 truncate mr-3">\${s}</span>
                    <button onclick="App.removeSource(\${i})" class="text-red-500 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition">Remove</button>
                </div>
            \`).join('') || '<p class="text-xs text-gray-400 font-bold uppercase py-2 text-center">No custom sources added.</p>';
        },

        copy: (id) => {
            const el = document.getElementById(id);
            navigator.clipboard.writeText(el.value);
            App.notify('Link Copied!');
        },

        views: {
          login: () => 
            '<div class="max-w-sm mx-auto mt-16 px-4"><div class="text-center mb-8"><div class="w-20 h-20 bg-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center mb-6 shadow-soft"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div><h1 class="text-3xl font-extrabold tracking-tight">Welcome</h1></div>' +
            '<div class="bg-white p-8 rounded-[32px] shadow-soft border border-gray-100 space-y-5">' +
            '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Username</label><input id="usr" class="w-full input-base px-5 py-3.5 rounded-xl text-base font-semibold" placeholder="admin"></div>' +
            '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Password</label><input id="pwd" type="password" class="w-full input-base px-5 py-3.5 rounded-xl text-base font-semibold" placeholder="••••••••"></div>' +
            '<div class="pt-3"><button id="authBtn" onclick="App.handleAuth(\\'login\\')" class="w-full btn-primary py-4 rounded-xl text-base font-bold shadow-md shadow-blue-900/10">Log In</button></div>' +
            '<button onclick="App.navigate(\\'/signup\\')" class="w-full bg-gray-50 text-gray-700 font-bold py-4 rounded-xl text-sm mt-2 hover:bg-gray-100 transition">Create Account</button></div></div>',
            
          signup: () => 
            '<div class="max-w-sm mx-auto mt-16 px-4"><div class="text-center mb-8"><h1 class="text-3xl font-extrabold tracking-tight">Setup Account</h1></div>' +
            '<div class="bg-white p-8 rounded-[32px] shadow-soft border border-gray-100 space-y-5">' +
            '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Username</label><input id="usr" class="w-full input-base px-5 py-3.5 rounded-xl text-base font-semibold" placeholder="username"></div>' +
            '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Password</label><input id="pwd" type="password" class="w-full input-base px-5 py-3.5 rounded-xl text-base font-semibold" placeholder="password"></div>' +
            '<div class="pt-3"><button id="authBtn" onclick="App.handleAuth(\\'signup\\')" class="w-full btn-primary py-4 rounded-xl text-base font-bold shadow-md shadow-blue-900/10">Sign Up</button></div>' +
            '<button onclick="App.navigate(\\'/login\\')" class="w-full bg-transparent text-gray-500 font-bold py-4 rounded-xl text-sm mt-1 hover:text-gray-900 transition">Back</button></div></div>',

          dashboard: () => 
            '<div class="max-w-3xl mx-auto"><div class="mb-8"><h1 class="text-3xl font-extrabold text-gray-900 mb-2">My Links</h1><p class="text-base text-gray-500 font-medium">Copy these URLs into CloudStream. They automatically sync with the plugins you select.</p></div>' +
            '<div class="space-y-6">' +
            '<div class="bg-white p-7 rounded-[32px] shadow-soft border border-gray-100"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5"><span class="font-extrabold text-gray-900 text-xl flex items-center gap-2"><div class="w-3 h-3 bg-blue-500 rounded-full"></div> Standard Library (SFW)</span><button onclick="App.copy(\\'def-movies\\')" class="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition">Copy URL</button></div><input id="def-movies" readonly class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-600 font-medium outline-none font-mono"></div>' +
            '<div class="bg-white p-7 rounded-[32px] shadow-soft border border-red-100"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5"><span class="font-extrabold text-red-600 text-xl flex items-center gap-2"><div class="w-3 h-3 bg-red-500 rounded-full"></div> Adult Library (18+)</span><button onclick="App.copy(\\'def-adult\\')" class="bg-red-50 text-red-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition">Copy URL</button></div><input id="def-adult" readonly class="w-full bg-red-50/50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-800 font-medium outline-none font-mono"></div>' +
            '</div></div>',
            
          plugins: () =>
            '<div class="flex flex-col lg:flex-row gap-6">' +
            '<div class="w-full lg:w-80 shrink-0 space-y-4">' +
               '<div class="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100 sticky top-20">' +
                  '<h2 class="font-extrabold text-gray-900 text-2xl mb-1">Configuration</h2>' +
                  '<p class="text-sm text-gray-500 font-medium mb-6">Select plugins to include in your links.</p>' +
                  '<div class="flex items-center justify-between bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-4"><span class="text-sm font-extrabold text-blue-800 uppercase tracking-wide">Selected</span><span id="selCount" class="text-3xl font-extrabold text-blue-600">0</span></div>' +
                  '<div class="flex gap-2 mb-6"><button onclick="App.selectAll()" class="flex-1 bg-gray-100 text-gray-800 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200 transition">Select All</button><button onclick="App.deselectAll()" class="flex-1 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl text-xs hover:bg-red-100 transition">Deselect All</button></div>' +
               '</div>' +
            '</div>' +
            '<div class="flex-1">' +
               '<div class="bg-white p-3.5 rounded-3xl shadow-soft border border-gray-100 flex flex-col sm:flex-row gap-3 mb-6 sticky top-16 z-30">' +
                  '<input onkeyup="App.searchExt(this.value)" placeholder="Search plugins..." class="flex-1 bg-gray-50 border border-gray-200 px-5 py-3 rounded-2xl text-base font-medium outline-none">' +
                  '<div class="flex gap-2 items-center">' +
                      '<div class="flex gap-1.5 bg-gray-100 p-1.5 rounded-2xl w-full sm:w-auto">' +
                         '<button id="f-all" onclick="App.setFilter(\\'all\\')" class="flex-1 sm:flex-none px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold transition">All</button>' +
                         '<button id="f-sfw" onclick="App.setFilter(\\'sfw\\')" class="flex-1 sm:flex-none px-6 py-2.5 text-gray-600 rounded-xl text-sm font-bold transition hover:bg-white hover:shadow-sm">SFW</button>' +
                         '<button id="f-nsfw" onclick="App.setFilter(\\'nsfw\\')" class="flex-1 sm:flex-none px-6 py-2.5 text-gray-600 rounded-xl text-sm font-bold transition hover:bg-white hover:shadow-sm">18+</button>' +
                      '</div>' +
                      '<button onclick="App.refreshPlugins()" class="bg-blue-50 text-blue-600 p-3.5 rounded-2xl border border-blue-100 hover:bg-blue-100 transition" title="Refresh Latest Plugins">' +
                          '<svg id="refreshIcon" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>' +
                      '</button>' +
                  '</div>' +
               '</div>' +
               '<div id="extGrid" class="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-10"></div>' +
            '</div>' +
            '</div>',

          settings: () => 
            '<div class="max-w-2xl mx-auto"><h1 class="text-3xl font-extrabold text-gray-900 mb-8">Settings</h1>' +
            '<div class="bg-white p-8 rounded-[32px] shadow-soft border border-gray-100 mb-6">' +
                '<h2 class="font-extrabold text-xl text-gray-900 mb-4">Account Credentials</h2>' +
                '<p class="text-base text-gray-500 mb-6 font-medium">Current Username: <span id="currentUsr" class="font-bold text-gray-800"></span></p>' +
                '<div class="space-y-5 mb-6">' +
                    '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">New Username (Optional)</label><input id="newUsr" class="w-full input-base px-5 py-3.5 rounded-2xl text-base font-medium" placeholder="Leave blank to keep current"></div>' +
                    '<div><label class="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">New Password (Optional)</label><input id="newPwd" type="password" class="w-full input-base px-5 py-3.5 rounded-2xl text-base font-medium" placeholder="Leave blank to keep current"></div>' +
                '</div>' +
                '<button onclick="App.updateCredentials()" class="btn-primary px-8 py-3.5 rounded-2xl text-base font-bold shadow-lg shadow-blue-900/10">Save Changes</button>' +
            '</div>' +
            '<div class="bg-white p-8 rounded-[32px] shadow-soft border border-gray-100">' +
                '<h2 class="font-extrabold text-xl text-gray-900 mb-1">Custom Plugin Sources</h2>' +
                '<p class="text-base text-gray-500 mb-6 font-medium">Add external plugins.json URLs to expand your library.</p>' +
                '<div class="flex gap-3 mb-6"><input id="newSrc" class="flex-1 input-base px-5 py-3.5 rounded-2xl text-sm font-mono" placeholder="https://.../plugins.json"><button onclick="App.addSource()" class="btn-primary px-8 py-3.5 rounded-2xl text-base font-bold shadow-lg shadow-blue-900/10">Add</button></div>' +
                '<div id="sourceList" class="space-y-3"></div>' +
            '</div></div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;
