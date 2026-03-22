export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CloudStream Bundle</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f1f5f9; color: #0f172a; -webkit-tap-highlight-color: transparent; }
        .shadow-soft { box-shadow: 0 2px 10px -2px rgba(0,0,0,0.05); }
        .input-base { background: #fff; border: 1.5px solid #e2e8f0; color: #0f172a; outline: none; transition: 0.2s; }
        .input-base:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .btn-primary { background: #0f172a; color: white; transition: 0.2s; }
        .btn-primary:active { transform: scale(0.96); }
        
        #toast-zone { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 99; display: flex; flex-direction: column; gap: 8px; width: 90%; max-w: 380px; }
        .toast { background: #0f172a; color: white; padding: 12px 16px; border-radius: 10px; font-weight: 600; font-size: 13px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.15); animation: dropDown 0.3s ease forwards; }
        .toast.error { background: #ef4444; }
        @keyframes dropDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .nav-link { color: #64748b; font-weight: 700; font-size: 13px; transition: 0.2s; padding: 6px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .nav-link:hover { color: #0f172a; background: #e2e8f0; }
        .nav-link.active { color: #2563eb; background: #dbeafe; }
        
        .loader { border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; width: 20px; height: 20px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Ultra Compact Switch */
        .ios-switch { position: relative; display: inline-block; width: 28px; height: 16px; }
        .ios-switch input { opacity: 0; width: 0; height: 0; }
        .ios-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 16px; }
        .ios-slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .ios-slider { background-color: #10b981; }
        input:checked + .ios-slider:before { transform: translateX(12px); }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="bg-white border-b border-gray-200 sticky top-0 z-40 hidden">
        <div class="max-w-[90rem] mx-auto px-4 h-14 flex justify-between items-center">
            <div class="flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563eb" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span class="font-extrabold text-lg tracking-tight hidden sm:block">CS Bundle</span>
            </div>
            <div class="hidden md:flex gap-1 items-center">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Dashboard</a>
                <a onclick="App.navigate('/links')" id="nav-/links" class="nav-link"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> Reseller Links</a>
                <a onclick="App.navigate('/extensions')" id="nav-/extensions" class="nav-link"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg> Plugins Hub</a>
                <div class="w-px h-4 bg-gray-300 mx-2"></div>
                <a onclick="App.logout()" class="nav-link text-red-500 hover:text-red-600 hover:bg-red-50"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Out</a>
            </div>
            <button class="md:hidden p-2 text-gray-600" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
        </div>
        <div id="mobileMenu" class="hidden md:hidden border-t border-gray-100 bg-gray-50 p-4 space-y-2 shadow-inner">
            <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-lg border border-gray-200">Dashboard</a>
            <a onclick="App.navigate('/links'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-lg border border-gray-200">Reseller Links</a>
            <a onclick="App.navigate('/extensions'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-lg border border-gray-200">Plugins Hub</a>
            <a onclick="App.logout()" class="block font-bold text-red-600 p-3 bg-red-50 rounded-lg mt-4">Log Out</a>
        </div>
    </nav>

    <main id="app-root" class="max-w-[90rem] mx-auto px-3 py-6"></main>

    <script>
      const App = {
        token: localStorage.getItem('cs_session'),
        user: localStorage.getItem('cs_user'),
        linkData: null,
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
          setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2000);
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
          else if (path === '/links') { root.innerHTML = App.views.links(); App.loadLinks(); }
          else if (path === '/extensions') { root.innerHTML = App.views.extensions(); App.loadExtensions(); }
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

        loadDashboard: () => {
            const base = window.location.origin;
            document.getElementById('def-movies').value = base + '/' + App.user + '/sfw/repo.json';
            document.getElementById('def-adult').value = base + '/' + App.user + '/nsfw/repo.json';
        },

        loadLinks: async () => {
            try {
                const data = await App.api('/api/links');
                App.linkData = data;
                App.renderLinksTable();
            } catch (e) { App.notify(e.error || 'Failed to load', true); }
        },

        createLink: async () => {
            const customId = document.getElementById('customId').value.trim();
            const name = document.getElementById('linkName').value.trim();
            try {
                await App.api('/api/links', 'POST', { id: customId, name: name || 'Client Link' });
                App.notify('Link Created');
                document.getElementById('customId').value = '';
                document.getElementById('linkName').value = '';
                App.loadLinks();
            } catch (e) { App.notify(e.error || 'Creation failed', true); }
        },

        toggleLinkStatus: async (id, currentStatus) => {
            try {
                await App.api('/api/links/' + id, 'PUT', { is_active: currentStatus ? 0 : 1 });
                App.loadLinks();
            } catch(e) {}
        },

        deleteLink: async (id) => {
            if(!confirm('Delete permanently?')) return;
            try {
                await App.api('/api/links/' + id, 'DELETE');
                App.loadLinks();
            } catch(e) {}
        },

        copy: (text) => {
            navigator.clipboard.writeText(text);
            App.notify('Copied!');
        },

        renderLinksTable: () => {
            const tbody = document.getElementById('linksTable');
            const base = window.location.origin;
            if(!App.linkData || App.linkData.length === 0) {
                tbody.innerHTML = '<div class="text-center py-10 text-gray-500 font-semibold bg-white rounded-2xl shadow-soft">No reseller links yet.</div>';
                return;
            }

            tbody.innerHTML = App.linkData.map(l => {
                const isActive = l.is_active === 1;
                const statusBadge = isActive ? '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Active</span>' : '<span class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Blocked</span>';
                
                return \`
                <div class="bg-white p-5 rounded-2xl shadow-soft mb-3 border border-gray-100 \${!isActive ? 'opacity-75' : ''}">
                    <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="font-extrabold text-base text-gray-900">\${l.name}</h3>
                                \${statusBadge}
                            </div>
                            <p class="text-[11px] text-gray-400 font-mono tracking-wider">ID: \${l.link_id}</p>
                        </div>
                        <div class="flex gap-4 text-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <div><p class="text-[9px] text-gray-500 font-bold uppercase mb-0.5">Clicks</p><p class="font-extrabold text-lg text-blue-600">\${l.total_clicks}</p></div>
                            <div class="w-px bg-gray-200"></div>
                            <div><p class="text-[9px] text-gray-500 font-bold uppercase mb-0.5">Users</p><p class="font-extrabold text-lg text-blue-600">\${l.unique_visitors}</p></div>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-2 mb-4">
                        <div class="bg-gray-50 p-2.5 rounded-xl flex justify-between items-center border border-gray-200">
                            <div><span class="block text-[9px] font-extrabold text-gray-500 uppercase mb-0.5">Safe Content</span><span class="text-[11px] font-mono text-gray-800 truncate block max-w-[150px] sm:max-w-[200px]">\${base}/\${l.link_id}/sfw/repo.json</span></div>
                            <button onclick="App.copy('\${base}/\${l.link_id}/sfw/repo.json')" class="bg-white shadow-sm border border-gray-300 text-gray-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-gray-100">Copy</button>
                        </div>
                        <div class="bg-red-50/50 p-2.5 rounded-xl flex justify-between items-center border border-red-100">
                            <div><span class="block text-[9px] font-extrabold text-red-500 uppercase mb-0.5">Adult Content</span><span class="text-[11px] font-mono text-red-900 truncate block max-w-[150px] sm:max-w-[200px]">\${base}/\${l.link_id}/nsfw/repo.json</span></div>
                            <button onclick="App.copy('\${base}/\${l.link_id}/nsfw/repo.json')" class="bg-white shadow-sm border border-red-200 text-red-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-red-50">Copy</button>
                        </div>
                    </div>

                    <div class="flex gap-2 border-t border-gray-100 pt-3">
                        <button onclick="App.toggleLinkStatus('\${l.link_id}', \${isActive})" class="flex-1 \${isActive ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'} py-2 rounded-lg text-[11px] font-bold">
                            \${isActive ? 'Block Link' : 'Unblock Link'}
                        </button>
                        <button onclick="App.deleteLink('\${l.link_id}')" class="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-[11px] font-bold">Delete</button>
                    </div>
                </div>\`;
            }).join('');
        },

        loadExtensions: async () => {
            try {
                const settings = await App.api('/api/user/settings');
                App.selected = new Set(settings.selected);
                App.customSources = settings.sources;
                App.renderSources();
                
                App.extData = await App.api('/api/extensions');
                App.renderExtGrid();
            } catch (e) {}
        },

        saveSettings: () => {
            document.getElementById('syncTag').classList.remove('hidden');
            clearTimeout(App.saveTimer);
            App.saveTimer = setTimeout(async () => {
                try {
                    await App.api('/api/user/settings', 'POST', { selected: Array.from(App.selected), sources: App.customSources });
                    setTimeout(() => document.getElementById('syncTag').classList.add('hidden'), 1000);
                } catch (e) { document.getElementById('syncTag').classList.add('hidden'); }
            }, 800);
        },

        togglePlugin: (id) => {
            if(App.selected.has(id)) App.selected.delete(id);
            else App.selected.add(id);
            App.renderExtGrid();
            App.saveSettings();
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
            if (!App.extData) {
                grid.innerHTML = '<div class="col-span-full py-20 text-center"><div class="loader"></div></div>';
                return;
            }

            let html = '';
            App.extData.forEach(p => {
                if (App.filterType === 'sfw' && p.isAdult) return;
                if (App.filterType === 'nsfw' && !p.isAdult) return;
                if (App.searchQuery && !p.name.toLowerCase().includes(App.searchQuery)) return;

                const isSelected = App.selected.has(p.internalName);
                const author = Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'N/A');
                const img = p.iconUrl || p.icon ? \`<img src="\${p.iconUrl || p.icon}" class="w-8 h-8 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0">\` : \`<div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-[8px] font-bold border border-gray-200 shrink-0">N/A</div>\`;
                const badge = p.isAdult ? '<span class="text-red-600 font-extrabold border border-red-200 bg-red-50 px-1 py-0.5 rounded text-[8px] tracking-wide uppercase">18+ NSFW</span>' : '<span class="text-green-600 font-extrabold border border-green-200 bg-green-50 px-1 py-0.5 rounded text-[8px] tracking-wide uppercase">SFW</span>';
                
                html += \`
                <div class="bg-white rounded-xl p-2 shadow-sm border transition-colors cursor-pointer \${isSelected ? 'border-blue-500 bg-blue-50/10 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}" onclick="App.togglePlugin('\${p.internalName}')">
                    <div class="flex items-center gap-2 mb-2">
                        \${img}
                        <div class="flex-1 min-w-0">
                            <h3 class="font-extrabold text-gray-900 text-[11px] truncate leading-tight" title="\${p.name}">\${p.name}</h3>
                            <p class="text-[9px] text-gray-500 font-semibold truncate leading-tight">\${author}</p>
                        </div>
                        <label class="ios-switch shrink-0 pointer-events-none">
                            <input type="checkbox" \${isSelected ? 'checked' : ''}><span class="ios-slider"></span>
                        </label>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-auto">
                        \${badge}
                        <span class="bg-gray-100 text-gray-600 border border-gray-200 px-1 py-0.5 rounded text-[8px] font-bold uppercase">\${p.language || 'EN'}</span>
                        <span class="bg-gray-100 text-gray-600 border border-gray-200 px-1 py-0.5 rounded text-[8px] font-bold">v\${p.version || 1}</span>
                        <span class="bg-gray-100 text-gray-600 border border-gray-200 px-1 py-0.5 rounded text-[8px] font-bold">\${p.formattedSize}</span>
                    </div>
                </div>\`;
            });
            grid.innerHTML = html || '<div class="col-span-full text-center text-gray-500 py-10 font-bold text-sm">No plugins found.</div>';
            document.getElementById('selCount').innerText = App.selected.size;
        },

        addSource: () => {
            const input = document.getElementById('newSrc');
            const val = input.value.trim();
            if(!val.startsWith('http')) return App.notify('Invalid URL', true);
            App.customSources.push(val);
            input.value = '';
            App.saveSettings();
            App.renderSources();
            App.loadExtensions(); // Refresh pool
        },

        removeSource: (index) => {
            App.customSources.splice(index, 1);
            App.saveSettings();
            App.renderSources();
            App.loadExtensions();
        },

        renderSources: () => {
            const list = document.getElementById('sourceList');
            if(!list) return;
            list.innerHTML = App.customSources.map((s, i) => \`
                <div class="flex justify-between items-center bg-gray-50 border border-gray-200 p-2 rounded-lg mb-1">
                    <span class="text-[9px] font-mono text-gray-600 truncate mr-2">\${s}</span>
                    <button onclick="App.removeSource(\${i})" class="text-red-500 font-bold text-[9px] bg-red-50 px-1.5 py-0.5 rounded">Rem</button>
                </div>
            \`).join('') || '<p class="text-[9px] text-gray-400 font-bold uppercase py-1">No custom sources</p>';
        },

        views: {
          login: () => 
            '<div class="max-w-xs mx-auto mt-16"><div class="text-center mb-8"><div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-soft"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div><h1 class="text-2xl font-extrabold tracking-tight">Welcome</h1></div>' +
            '<div class="bg-white p-6 rounded-[24px] shadow-soft border border-gray-100 space-y-4">' +
            '<div><label class="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Username</label><input id="usr" class="w-full input-base px-4 py-3 rounded-xl text-sm font-semibold" placeholder="admin"></div>' +
            '<div><label class="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Password</label><input id="pwd" type="password" class="w-full input-base px-4 py-3 rounded-xl text-sm font-semibold" placeholder="••••••••"></div>' +
            '<div class="pt-2"><button id="authBtn" onclick="App.handleAuth(\\'login\\')" class="w-full btn-primary py-3.5 rounded-xl text-sm font-bold shadow-md shadow-blue-900/10">Log In</button></div>' +
            '<button onclick="App.navigate(\\'/signup\\')" class="w-full bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm mt-2">Sign Up</button></div></div>',
            
          signup: () => 
            '<div class="max-w-xs mx-auto mt-16"><div class="text-center mb-8"><h1 class="text-2xl font-extrabold tracking-tight">Create Account</h1></div>' +
            '<div class="bg-white p-6 rounded-[24px] shadow-soft border border-gray-100 space-y-4">' +
            '<div><label class="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Username</label><input id="usr" class="w-full input-base px-4 py-3 rounded-xl text-sm font-semibold" placeholder="username"></div>' +
            '<div><label class="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Password</label><input id="pwd" type="password" class="w-full input-base px-4 py-3 rounded-xl text-sm font-semibold" placeholder="password"></div>' +
            '<div class="pt-2"><button id="authBtn" onclick="App.handleAuth(\\'signup\\')" class="w-full btn-primary py-3.5 rounded-xl text-sm font-bold shadow-md shadow-blue-900/10">Sign Up</button></div>' +
            '<button onclick="App.navigate(\\'/login\\')" class="w-full bg-transparent text-gray-500 font-bold py-3.5 rounded-xl text-sm mt-1 hover:text-gray-900">Back</button></div></div>',

          dashboard: () => 
            '<div class="max-w-2xl mx-auto"><div class="mb-6"><h1 class="text-2xl font-extrabold text-gray-900 mb-1">Personal Links</h1><p class="text-sm text-gray-500 font-medium">These links automatically sync with your selected plugins.</p></div>' +
            '<div class="space-y-4">' +
            '<div class="bg-white p-5 rounded-2xl shadow-soft border border-gray-100"><div class="flex justify-between items-center mb-3"><span class="font-extrabold text-gray-900 text-sm flex items-center gap-2"><div class="w-2 h-2 bg-blue-500 rounded-full"></div> Safe Library</span><button onclick="App.copy(document.getElementById(\\'def-movies\\').value)" class="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200">Copy URL</button></div><input id="def-movies" readonly class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-600 font-medium outline-none font-mono"></div>' +
            '<div class="bg-white p-5 rounded-2xl shadow-soft border border-red-100"><div class="flex justify-between items-center mb-3"><span class="font-extrabold text-red-600 text-sm flex items-center gap-2"><div class="w-2 h-2 bg-red-500 rounded-full"></div> Adult Library (18+)</span><button onclick="App.copy(document.getElementById(\\'def-adult\\').value)" class="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">Copy URL</button></div><input id="def-adult" readonly class="w-full bg-red-50/50 border border-red-100 rounded-xl px-3 py-2.5 text-xs text-red-800 font-medium outline-none font-mono"></div>' +
            '</div></div>',

          links: () => 
            '<div class="max-w-3xl mx-auto"><div class="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6"><div><h1 class="text-2xl font-extrabold text-gray-900 mb-1">Reseller Links</h1><p class="text-sm text-gray-500 font-medium">Generate custom URLs. Synced with your plugins.</p></div>' +
            '<div class="bg-white p-2 rounded-xl shadow-soft border border-gray-100 flex gap-2 w-full md:w-auto"><input id="customId" placeholder="ID (Opt)" maxlength="10" class="w-24 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-none font-mono uppercase font-bold"><input id="linkName" placeholder="Client Name" class="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none font-medium"><button onclick="App.createLink()" class="btn-primary px-4 py-2 rounded-lg text-xs font-bold">Add</button></div></div>' +
            '<div id="linksTable" class="space-y-3"><div class="py-20 text-center"><div class="loader"></div></div></div></div>',
            
          extensions: () =>
            '<div class="flex flex-col lg:flex-row gap-5 max-w-[90rem] mx-auto">' +
            '<div class="w-full lg:w-64 shrink-0 space-y-3">' +
               '<div class="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 sticky top-20">' +
                  '<div class="flex justify-between items-center mb-4"><h2 class="font-extrabold text-gray-900 text-sm">Control Panel</h2><span id="syncTag" class="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase hidden">Saving...</span></div>' +
                  '<div class="flex items-center justify-between bg-blue-50 border border-blue-100 p-2.5 rounded-xl mb-5"><span class="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Selected</span><span id="selCount" class="text-base font-extrabold text-blue-600">0</span></div>' +
                  '<h3 class="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Custom Sources</h3>' +
                  '<div class="flex gap-1.5 mb-3"><input id="newSrc" class="flex-1 input-base px-2.5 py-1.5 rounded-lg text-[10px] font-mono" placeholder="URL..."><button onclick="App.addSource()" class="btn-primary px-3 py-1.5 rounded-lg text-[10px] font-bold">Add</button></div>' +
                  '<div id="sourceList" class="max-h-32 overflow-y-auto space-y-1"></div>' +
               '</div>' +
            '</div>' +
            '<div class="flex-1">' +
               '<div class="bg-white p-2 rounded-xl shadow-soft border border-gray-100 flex flex-col sm:flex-row gap-2 mb-4 sticky top-16 z-30">' +
                  '<input onkeyup="App.searchExt(this.value)" placeholder="Search all plugins..." class="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium outline-none">' +
                  '<div class="flex gap-1 bg-gray-100 p-1 rounded-lg">' +
                     '<button id="f-all" onclick="App.setFilter(\\'all\\')" class="flex-1 sm:flex-none px-3 py-1 bg-gray-900 text-white rounded text-[11px] font-bold">All</button>' +
                     '<button id="f-sfw" onclick="App.setFilter(\\'sfw\\')" class="flex-1 sm:flex-none px-3 py-1 text-gray-600 rounded text-[11px] font-bold hover:bg-white">SFW</button>' +
                     '<button id="f-nsfw" onclick="App.setFilter(\\'nsfw\\')" class="flex-1 sm:flex-none px-3 py-1 text-gray-600 rounded text-[11px] font-bold hover:bg-white">18+</button>' +
                  '</div>' +
               '</div>' +
               // COMPACT GRID: 2 on mobile, 3 tablet, 4/5/6 on larger screens
               '<div id="extGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 pb-10"></div>' +
            '</div>' +
            '</div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;
