export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>My CloudStream</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f2f2f7; color: #1c1c1e; -webkit-tap-highlight-color: transparent; }
        .shadow-ios { box-shadow: 0 4px 14px 0 rgba(0,0,0,0.04), 0 0 1px 0 rgba(0,0,0,0.1); }
        .input-ios { background: #fff; border: 1px solid #e5e5ea; color: #1c1c1e; transition: all 0.2s ease; outline: none; }
        .input-ios:focus { border-color: #007aff; box-shadow: 0 0 0 3px rgba(0,122,255,0.15); }
        .btn-ios { background: #000; color: white; transition: transform 0.15s ease, opacity 0.15s ease; }
        .btn-ios:active { transform: scale(0.96); opacity: 0.8; }
        
        #toast-zone { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; flex-direction: column; gap: 8px; width: 90%; max-w: 340px; pointer-events: none; }
        .toast { background: rgba(28, 28, 30, 0.9); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: white; padding: 12px 20px; border-radius: 100px; font-weight: 600; font-size: 13px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: dropDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .toast.error { background: rgba(255, 59, 48, 0.95); }
        @keyframes dropDown { 0% { transform: translateY(-20px) scale(0.9); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }

        .nav-link { color: #8e8e93; font-weight: 600; transition: all 0.2s ease; padding: 6px 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; }
        .nav-link:hover { color: #1c1c1e; background: #e5e5ea; }
        .nav-link.active { color: #007aff; background: #e5f1ff; }
        
        .loader { border: 3px solid #e5e5ea; border-top-color: #007aff; border-radius: 50%; width: 20px; height: 20px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        .spin-fast { animation: spin 0.4s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ios-switch { position: relative; display: inline-block; width: 34px; height: 20px; }
        .ios-switch input { opacity: 0; width: 0; height: 0; }
        .ios-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e5e5ea; transition: .3s; border-radius: 20px; }
        .ios-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .3s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.15); }
        input:checked + .ios-slider { background-color: #34c759; }
        input:checked + .ios-slider:before { transform: translateX(14px); }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 hidden">
        <div class="max-w-[100rem] mx-auto px-4 h-14 flex justify-between items-center">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-black rounded-[10px] flex items-center justify-center shadow-sm">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <span class="font-bold text-lg tracking-tight hidden sm:block">My CS</span>
                <span id="syncTag" class="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full hidden ml-1">Saving...</span>
            </div>
            
            <div class="hidden md:flex gap-1 items-center">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Home</a>
                <a onclick="App.navigate('/plugins')" id="nav-/plugins" class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Plugins</a>
                <a onclick="App.navigate('/settings')" id="nav-/settings" class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Settings</a>
                
                <a href="https://github.com/recloudstream/cloudstream/releases/" target="_blank" class="nav-link !bg-gray-100 !text-gray-900 ml-2 hover:!bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Get App</a>
                <div class="w-px h-4 bg-gray-300 mx-2"></div>
                <a onclick="App.logout()" class="nav-link text-red-500 hover:text-red-600 hover:bg-red-50"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Out</a>
            </div>
            <button class="md:hidden p-1.5 text-gray-600 bg-gray-100 rounded-lg" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </div>
        
        <div id="mobileMenu" class="hidden md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg px-4 py-6 space-y-6">
            <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Navigation</p>
                <div class="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="flex items-center gap-3 font-semibold text-gray-700 p-4 border-b border-gray-100 active:bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Home</a>
                    <a onclick="App.navigate('/plugins'); document.getElementById('mobileMenu').classList.add('hidden')" class="flex items-center gap-3 font-semibold text-gray-700 p-4 border-b border-gray-100 active:bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Manage Plugins</a>
                    <a onclick="App.navigate('/settings'); document.getElementById('mobileMenu').classList.add('hidden')" class="flex items-center gap-3 font-semibold text-gray-700 p-4 active:bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Settings</a>
                </div>
            </div>
            <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Resources</p>
                <div class="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <a href="https://github.com/recloudstream/cloudstream/releases/" target="_blank" class="flex items-center justify-between font-semibold text-gray-700 p-4 border-b border-gray-100 active:bg-gray-200"><span>Get App (Releases)</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="gray" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></a>
                </div>
            </div>
            <a onclick="App.logout()" class="flex justify-center items-center gap-2 font-bold text-red-500 p-4 bg-red-50 rounded-2xl active:bg-red-100 transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Log Out</a>
        </div>
    </nav>

    <main id="app-root" class="max-w-[100rem] mx-auto px-4 py-8"></main>

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
          t.className = 'toast' + (isError ? ' error' : ''); t.innerText = msg;
          zone.appendChild(t);
          setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2500);
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
          if (!u || !p) return App.notify('Required fields missing', true);
          
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
        
        setFilter: (type) => { 
            App.filterType = type;
            ['all', 'sfw', 'nsfw'].forEach(t => {
                const btn = document.getElementById('f-' + t);
                if(t === type) { 
                    btn.className = "flex-1 sm:flex-none px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all shadow-sm bg-white text-black"; 
                } else { 
                    btn.className = "flex-1 sm:flex-none px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all text-gray-500 hover:text-black"; 
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
                const img = p.iconUrl || p.icon ? \`<img src="\${p.iconUrl || p.icon}" class="w-10 h-10 rounded-[10px] object-cover bg-gray-50 border border-gray-100 shrink-0">\` : \`<div class="w-10 h-10 rounded-[10px] bg-gray-100 flex items-center justify-center text-gray-400 text-[9px] font-bold border border-gray-200 shrink-0">N/A</div>\`;
                const badge = p.isAdult ? '<span class="text-red-600 font-bold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md text-[9px] tracking-wide uppercase">18+ Adult</span>' : '<span class="text-green-600 font-bold bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md text-[9px] tracking-wide uppercase">Safe Content</span>';
                
                html += \`
                <div class="bg-white rounded-[16px] p-3 shadow-ios border transition-all cursor-pointer select-none flex flex-col justify-between \${isSelected ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/50' : 'border-gray-200 hover:border-gray-300'}" onclick="App.togglePlugin('\${p.internalName}')">
                    <div class="flex items-center gap-3 mb-2.5">
                        \${img}
                        <div class="flex-1 min-w-0 pt-0.5">
                            <h3 class="font-bold text-gray-900 text-xs truncate leading-tight" title="\${p.name}">\${p.name}</h3>
                            <p class="text-[10px] text-gray-500 font-medium truncate mt-0.5">\${Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'N/A')}</p>
                        </div>
                        <label class="ios-switch shrink-0 pointer-events-none transform scale-[0.85] origin-right">
                            <input type="checkbox" \${isSelected ? 'checked' : ''}><span class="ios-slider"></span>
                        </label>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5">
                        \${badge}
                        <span class="text-gray-500 px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase bg-gray-50 border border-gray-100">\${p.language || 'EN'}</span>
                        <span class="text-gray-500 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-gray-50 border border-gray-100">v\${p.version || 1}</span>
                        <span class="text-gray-500 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-gray-50 border border-gray-100">\${p.formattedSize}</span>
                    </div>
                </div>\`;
            });
            grid.innerHTML = html || '<div class="col-span-full text-center text-gray-400 py-10 font-bold text-sm">No plugins match your filter.</div>';
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
                <div class="flex justify-between items-center bg-gray-50 border border-gray-200 p-2.5 rounded-xl mb-2">
                    <span class="text-[10px] font-mono text-gray-600 truncate mr-3">\${s}</span>
                    <button onclick="App.removeSource(\${i})" class="text-red-500 font-bold text-[10px] bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition">Rem</button>
                </div>
            \`).join('') || '<p class="text-[10px] text-gray-400 font-bold uppercase py-2 text-center">No custom sources added.</p>';
        },

        copy: (id) => {
            const el = document.getElementById(id);
            navigator.clipboard.writeText(el.value);
            App.notify('Link Copied!');
        },

        views: {
          login: () => 
            '<div class="max-w-sm mx-auto mt-16 px-4"><div class="text-center mb-8"><div class="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-ios"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div><h1 class="text-2xl font-bold tracking-tight">Welcome to My CS</h1></div>' +
            '<div class="bg-white p-7 rounded-[28px] shadow-ios border border-gray-100 space-y-4">' +
            '<div><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Username</label><input id="usr" class="w-full input-ios px-4 py-3 rounded-[14px] text-sm font-semibold" placeholder="admin"></div>' +
            '<div><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Password</label><input id="pwd" type="password" class="w-full input-ios px-4 py-3 rounded-[14px] text-sm font-semibold" placeholder="••••••••"></div>' +
            '<div class="pt-3"><button id="authBtn" onclick="App.handleAuth(\\'login\\')" class="w-full btn-ios py-3.5 rounded-[14px] text-sm font-bold shadow-md shadow-black/10">Log In</button></div>' +
            '<button onclick="App.navigate(\\'/signup\\')" class="w-full bg-gray-50 text-gray-700 font-bold py-3.5 rounded-[14px] text-sm mt-2 hover:bg-gray-100 transition">Create Account</button></div></div>',
            
          signup: () => 
            '<div class="max-w-sm mx-auto mt-16 px-4"><div class="text-center mb-8"><h1 class="text-2xl font-bold tracking-tight">Setup Account</h1></div>' +
            '<div class="bg-white p-7 rounded-[28px] shadow-ios border border-gray-100 space-y-4">' +
            '<div><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Username</label><input id="usr" class="w-full input-ios px-4 py-3 rounded-[14px] text-sm font-semibold" placeholder="Choose a username"></div>' +
            '<div><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Password</label><input id="pwd" type="password" class="w-full input-ios px-4 py-3 rounded-[14px] text-sm font-semibold" placeholder="Create a password"></div>' +
            '<div class="pt-3"><button id="authBtn" onclick="App.handleAuth(\\'signup\\')" class="w-full btn-ios py-3.5 rounded-[14px] text-sm font-bold shadow-md shadow-black/10">Sign Up</button></div>' +
            '<button onclick="App.navigate(\\'/login\\')" class="w-full bg-transparent text-gray-500 font-bold py-3.5 rounded-[14px] text-sm mt-1 hover:text-gray-900 transition">Back</button></div></div>',

          dashboard: () => 
            '<div class="max-w-2xl mx-auto"><div class="mb-6"><h1 class="text-2xl font-bold text-gray-900 mb-1">My Links</h1><p class="text-sm text-gray-500">Copy these URLs into CloudStream. They auto-sync with your plugins.</p></div>' +
            '<div class="space-y-4">' +
            '<div class="bg-white p-6 rounded-[24px] shadow-ios border border-gray-100"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4"><span class="font-bold text-gray-900 text-base flex items-center gap-2"><div class="w-2.5 h-2.5 bg-purple-500 rounded-full"></div> Everything (All-in-One Bundle)</span><button onclick="App.copy(\\'def-all\\')" class="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition">Copy URL</button></div><input id="def-all" readonly class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-600 font-medium outline-none font-mono"></div>' +
            '<div class="bg-white p-6 rounded-[24px] shadow-ios border border-gray-100"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4"><span class="font-bold text-gray-900 text-base flex items-center gap-2"><div class="w-2.5 h-2.5 bg-blue-500 rounded-full"></div> Safe Content (Movies, Anime)</span><button onclick="App.copy(\\'def-movies\\')" class="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition">Copy URL</button></div><input id="def-movies" readonly class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-600 font-medium outline-none font-mono"></div>' +
            '<div class="bg-white p-6 rounded-[24px] shadow-ios border border-red-50"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4"><span class="font-bold text-red-600 text-base flex items-center gap-2"><div class="w-2.5 h-2.5 bg-red-500 rounded-full"></div> Adult Content (18+)</span><button onclick="App.copy(\\'def-adult\\')" class="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition">Copy URL</button></div><input id="def-adult" readonly class="w-full bg-red-50/30 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-800 font-medium outline-none font-mono"></div>' +
            '</div></div>',
            
          plugins: () =>
            '<div class="flex flex-col md:flex-row gap-5">' +
            '<div class="w-full md:w-64 shrink-0 space-y-4">' +
               '<div class="bg-white p-5 rounded-[24px] shadow-ios border border-gray-100 sticky top-20">' +
                  '<h2 class="font-bold text-gray-900 text-lg mb-1">Configuration</h2>' +
                  '<p class="text-xs text-gray-500 mb-5">Toggle plugins to sync.</p>' +
                  '<div class="flex items-center justify-between bg-[#f2f2f7] border border-gray-200 p-3.5 rounded-xl mb-5"><span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Selected</span><span id="selCount" class="text-xl font-bold text-gray-900">0</span></div>' +
                  '<h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Add Source</h3>' +
                  '<div class="flex gap-2 mb-3"><input id="newSrc" class="flex-1 input-ios px-3 py-2 rounded-xl text-[11px] font-mono" placeholder="https://.../plugins.json"><button onclick="App.addSource()" class="btn-ios px-3.5 py-2 rounded-xl text-[11px] font-bold">Add</button></div>' +
                  '<div id="sourceList" class="max-h-40 overflow-y-auto space-y-1 pr-1"></div>' +
               '</div>' +
            '</div>' +
            '<div class="flex-1">' +
               '<div class="bg-white/80 backdrop-blur-md p-2 rounded-[16px] shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-2 mb-4 sticky top-16 z-30">' +
                  '<div class="flex gap-1.5 items-center w-full">' +
                      '<div class="flex gap-1 bg-[#e5e5ea] p-1.5 rounded-xl w-full sm:w-auto">' +
                         '<button id="f-all" onclick="App.setFilter(\\'all\\')" class="flex-1 sm:flex-none px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all shadow-sm bg-white text-black">All Extensions</button>' +
                         '<button id="f-sfw" onclick="App.setFilter(\\'sfw\\')" class="flex-1 sm:flex-none px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all text-gray-500 hover:text-black">Safe Content</button>' +
                         '<button id="f-nsfw" onclick="App.setFilter(\\'nsfw\\')" class="flex-1 sm:flex-none px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all text-gray-500 hover:text-black">Adult Content (18+)</button>' +
                      '</div>' +
                      '<button onclick="App.refreshPlugins()" class="bg-gray-100 text-gray-700 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-200 transition shrink-0 ml-auto" title="Refresh Latest Plugins">' +
                          '<svg id="refreshIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>' +
                      '</button>' +
                  '</div>' +
               '</div>' +
               // ULTRA DENSE GRID
               '<div id="extGrid" class="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-10"></div>' +
            '</div>' +
            '</div>',

          settings: () => 
            '<div class="max-w-2xl mx-auto"><h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>' +
            '<div class="bg-white p-7 rounded-[28px] shadow-ios border border-gray-100 mb-6">' +
                '<h2 class="font-bold text-lg text-gray-900 mb-2">Credentials</h2>' +
                '<p class="text-sm text-gray-500 mb-5">Current Username: <span id="currentUsr" class="font-bold text-gray-800"></span></p>' +
                '<div class="space-y-4 mb-5">' +
                    '<div><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">New Username (Opt)</label><input id="newUsr" class="w-full input-ios px-4 py-3 rounded-[14px] text-sm font-medium" placeholder="Leave blank to keep"></div>' +
                    '<div><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">New Password (Opt)</label><input id="newPwd" type="password" class="w-full input-ios px-4 py-3 rounded-[14px] text-sm font-medium" placeholder="Leave blank to keep"></div>' +
                '</div>' +
                '<button onclick="App.updateCredentials()" class="btn-ios px-6 py-3 rounded-[14px] text-sm font-bold shadow-sm shadow-black/10">Save Changes</button>' +
            '</div></div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;
