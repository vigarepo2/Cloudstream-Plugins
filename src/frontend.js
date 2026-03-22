export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CloudStream Bundle</title>
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

        .nav-link { color: #64748b; font-weight: 700; transition: color 0.2s; padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; items-center; gap: 6px; }
        .nav-link:hover { color: #0f172a; background: #f1f5f9; }
        .nav-link.active { color: #2563eb; background: #eff6ff; }
        
        .loader { border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; width: 22px; height: 22px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Compact iOS Toggle Switch */
        .ios-switch { position: relative; display: inline-block; width: 36px; height: 20px; }
        .ios-switch input { opacity: 0; width: 0; height: 0; }
        .ios-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e2e8f0; transition: .3s; border-radius: 20px; }
        .ios-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        input:checked + .ios-slider { background-color: #10b981; }
        input:checked + .ios-slider:before { transform: translateX(16px); }
    </style>
</head>
<body>
    <div id="toast-zone"></div>

    <nav id="topNav" class="bg-white border-b border-gray-200 sticky top-0 z-40 hidden">
        <div class="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2563eb" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span class="font-extrabold text-xl tracking-tight hidden sm:block">CS Bundle</span>
                <span id="save-status" class="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-1 rounded uppercase tracking-wider hidden ml-2">Saved</span>
            </div>
            <div class="hidden md:flex gap-1 items-center">
                <a onclick="App.navigate('/dashboard')" id="nav-/dashboard" class="nav-link"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Dashboard</a>
                <a onclick="App.navigate('/links')" id="nav-/links" class="nav-link"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> Reseller Links</a>
                <a onclick="App.navigate('/extensions')" id="nav-/extensions" class="nav-link"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> Plugins</a>
                <div class="w-px h-5 bg-gray-300 mx-2"></div>
                <a onclick="App.logout()" class="nav-link text-red-500 hover:text-red-600 hover:bg-red-50"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Log Out</a>
            </div>
            <button class="md:hidden p-2 text-gray-600" onclick="document.getElementById('mobileMenu').classList.toggle('hidden')">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
        </div>
        <div id="mobileMenu" class="hidden md:hidden border-t border-gray-100 bg-gray-50 p-4 space-y-2 shadow-inner">
            <a onclick="App.navigate('/dashboard'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-xl border border-gray-200">Dashboard</a>
            <a onclick="App.navigate('/links'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-xl border border-gray-200">Reseller Links</a>
            <a onclick="App.navigate('/extensions'); document.getElementById('mobileMenu').classList.add('hidden')" class="block font-bold text-gray-700 p-3 bg-white rounded-xl border border-gray-200">Select Plugins</a>
            <a onclick="App.logout()" class="block font-bold text-red-600 p-3 bg-red-50 rounded-xl mt-4">Log Out</a>
        </div>
    </nav>

    <main id="app-root" class="max-w-7xl mx-auto px-4 py-8"></main>

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
                App.notify('Incorrect password.', true);
            } else {
                App.notify(e.error || 'Authentication failed.', true);
            }
          }
        },

        loadDashboard: () => {
            const base = window.location.origin;
            // The Personal Link uses the User's Username
            document.getElementById('def-movies').value = base + '/' + App.user + '/sfw/repo.json';
            document.getElementById('def-adult').value = base + '/' + App.user + '/nsfw/repo.json';
        },

        loadLinks: async () => {
            try {
                const data = await App.api('/api/links');
                App.linkData = data;
                App.renderLinksTable();
            } catch (e) { App.notify(e.error || 'Failed to load links', true); }
        },

        createLink: async () => {
            const customId = document.getElementById('customId').value.trim();
            const name = document.getElementById('linkName').value.trim();
            try {
                await App.api('/api/links', 'POST', { id: customId, name: name || 'Client Link' });
                App.notify('Access Link created!');
                document.getElementById('customId').value = '';
                document.getElementById('linkName').value = '';
                App.loadLinks();
            } catch (e) { App.notify(e.error || 'Failed to create link', true); }
        },

        toggleLinkStatus: async (id, currentStatus) => {
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
            
            if(!App.linkData || App.linkData.length === 0) {
                tbody.innerHTML = '<div class="text-center py-10 text-gray-500 font-semibold bg-white rounded-3xl shadow-soft border border-gray-100">No reseller links created yet.</div>';
                return;
            }

            tbody.innerHTML = App.linkData.map(l => {
                const isActive = l.is_active === 1;
                const statusBadge = isActive ? '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide">Active</span>' : '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide">Blocked</span>';
                
                return \`
                <div class="bg-white p-6 rounded-3xl shadow-soft mb-4 border border-gray-100 relative overflow-hidden \${!isActive ? 'opacity-75 grayscale-[0.5]' : ''}">
                    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
                        <div>
                            <div class="flex items-center gap-3 mb-1">
                                <h3 class="font-extrabold text-lg text-gray-900">\${l.name}</h3>
                                \${statusBadge}
                            </div>
                            <p class="text-[11px] text-gray-400 font-mono tracking-wider">ID: \${l.link_id}</p>
                        </div>
                        <div class="flex gap-4 text-center bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                            <div><p class="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Clicks</p><p class="font-extrabold text-xl text-blue-600">\${l.total_clicks}</p></div>
                            <div class="w-px bg-gray-200"></div>
                            <div><p class="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Users</p><p class="font-extrabold text-xl text-blue-600">\${l.unique_visitors}</p></div>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-3 mb-5">
                        <div class="bg-gray-50 p-3 rounded-2xl flex justify-between items-center border border-gray-200">
                            <div><span class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Standard Library</span><span class="text-xs font-mono text-gray-800 truncate block max-w-[180px] sm:max-w-[220px]">\${base}/\${l.link_id}/sfw/repo.json</span></div>
                            <button onclick="App.copy('\${base}/\${l.link_id}/sfw/repo.json')" class="bg-white shadow-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-gray-100">Copy</button>
                        </div>
                        <div class="bg-red-50/50 p-3 rounded-2xl flex justify-between items-center border border-red-100">
                            <div><span class="block text-[10px] font-extrabold text-red-500 uppercase tracking-wide mb-1">Adult Library</span><span class="text-xs font-mono text-red-900 truncate block max-w-[180px] sm:max-w-[220px]">\${base}/\${l.link_id}/nsfw/repo.json</span></div>
                            <button onclick="App.copy('\${base}/\${l.link_id}/nsfw/repo.json')" class="bg-white shadow-sm border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-red-50">Copy</button>
                        </div>
                    </div>

                    <div class="flex gap-2 border-t border-gray-100 pt-4 mt-2">
                        <button onclick="App.toggleLinkStatus('\${l.link_id}', \${isActive})" class="flex-1 \${isActive ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-green-50 text-green-700 hover:bg-green-100'} py-2.5 rounded-xl text-xs font-bold transition">
                            \${isActive ? 'Block Link' : 'Unblock Link'}
                        </button>
                        <button onclick="App.deleteLink('\${l.link_id}')" class="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-xl text-xs font-bold transition">Delete Permanently</button>
                    </div>
                </div>\`;
            }).join('');
        },

        loadExtensions: async () => {
            try {
                // First fetch user settings (selections and sources)
                const settings = await App.api('/api/user/settings');
                App.selected = new Set(settings.selected);
                App.customSources = settings.sources;
                App.renderSources();
                
                // Then fetch all plugin data
                App.extData = await App.api('/api/extensions');
                App.renderExtGrid();
            } catch (e) { App.notify('Failed to load plugins', true); }
        },

        saveSettings: async () => {
            const s = document.getElementById('save-status');
            s.classList.remove('hidden');
            try {
                await App.api('/api/user/settings', 'POST', { selected: Array.from(App.selected), sources: App.customSources });
                setTimeout(() => s.classList.add('hidden'), 2000);
            } catch (e) { App.notify('Failed to save selections', true); s.classList.add('hidden'); }
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
                const author = Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'Unknown');
                const img = p.iconUrl || p.icon ? \`<img src="\${p.iconUrl || p.icon}" class="w-10 h-10 rounded-xl object-cover bg-gray-50 border border-gray-100">\` : \`<div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold border border-gray-200">N/A</div>\`;
                const badge = p.isAdult ? '<span class="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase">18+</span>' : '<span class="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase">SFW</span>';
                
                html += \`
                <div class="bg-white rounded-2xl p-3 shadow-sm border transition-colors cursor-pointer \${isSelected ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200 hover:border-blue-200'}" onclick="App.togglePlugin('\${p.internalName}')">
                    <div class="flex items-start gap-3 mb-2">
                        \${img}
                        <div class="flex-1 min-w-0 pt-0.5">
                            <h3 class="font-extrabold text-gray-900 text-xs truncate" title="\${p.name}">\${p.name}</h3>
                            <p class="text-[10px] text-gray-500 font-semibold truncate mt-0.5">\${author}</p>
                        </div>
                        <label class="ios-switch shrink-0 pointer-events-none mt-1">
                            <input type="checkbox" \${isSelected ? 'checked' : ''}><span class="ios-slider"></span>
                        </label>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100">
                        \${badge}
                        <span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">\${p.language || 'EN'}</span>
                        <span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-bold">v\${p.version || 1}</span>
                        <span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-bold">\${p.formattedSize}</span>
                    </div>
                </div>\`;
            });
            grid.innerHTML = html || '<div class="col-span-full text-center text-gray-500 py-10 font-bold">No plugins found.</div>';
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
            App.loadExtensions(); // Reload plugins with new source
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
                <div class="flex justify-between items-center bg-gray-50 border border-gray-200 p-2.5 rounded-xl mb-2">
                    <span class="text-[11px] font-mono text-gray-600 truncate mr-3">\${s}</span>
                    <button onclick="App.removeSource(\${i})" class="text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded-lg">Remove</button>
                </div>
            \`).join('') || '<p class="text-[11px] text-gray-400 text-center font-bold uppercase py-2">No external sources added.</p>';
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
            '<div class="max-w-3xl mx-auto"><div class="mb-8"><h1 class="text-3xl font-extrabold text-gray-900 mb-2">Personal Links</h1><p class="text-gray-500 font-medium">These links automatically sync with the plugins you select.</p></div>' +
            '<div class="space-y-4">' +
            '<div class="bg-white p-6 rounded-3xl shadow-soft border border-gray-100"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4"><span class="font-extrabold text-gray-900 text-lg flex items-center gap-2"><div class="w-2.5 h-2.5 bg-blue-500 rounded-full"></div> Standard Library</span><button onclick="App.copy(document.getElementById(\\'def-movies\\').value)" class="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition">Copy URL</button></div><input id="def-movies" readonly class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-600 font-medium outline-none font-mono"></div>' +
            '<div class="bg-white p-6 rounded-3xl shadow-soft border border-red-100"><div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4"><span class="font-extrabold text-red-600 text-lg flex items-center gap-2"><div class="w-2.5 h-2.5 bg-red-500 rounded-full"></div> Adult Library (18+)</span><button onclick="App.copy(document.getElementById(\\'def-adult\\').value)" class="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition">Copy URL</button></div><input id="def-adult" readonly class="w-full bg-red-50/50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-800 font-medium outline-none font-mono"></div>' +
            '</div></div>',

          links: () => 
            '<div class="max-w-4xl mx-auto"><div class="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8"><div><h1 class="text-3xl font-extrabold text-gray-900 mb-2">Reseller Links</h1><p class="text-gray-500 font-medium">Create links for users. These also sync with your selected plugins.</p></div>' +
            '<div class="bg-white p-2 rounded-2xl shadow-soft border border-gray-100 flex gap-2 w-full md:w-auto"><input id="customId" placeholder="ID (Optional)" maxlength="10" class="w-28 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-xs outline-none font-mono uppercase font-bold"><input id="linkName" placeholder="Client Name" class="flex-1 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-sm outline-none font-medium"><button onclick="App.createLink()" class="btn-primary px-5 py-2 rounded-xl text-sm font-bold">Create</button></div></div>' +
            '<div id="linksTable" class="space-y-4"><div class="py-20 text-center"><div class="loader"></div></div></div></div>',
            
          extensions: () =>
            '<div class="flex flex-col lg:flex-row gap-6">' +
            '<div class="w-full lg:w-72 shrink-0 space-y-4">' +
               '<div class="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 sticky top-20">' +
                  '<h2 class="font-extrabold text-gray-900 text-lg mb-1">Configuration</h2>' +
                  '<p class="text-xs text-gray-500 mb-5">Toggle plugins below. Your links automatically update.</p>' +
                  '<div class="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-xl mb-6"><span class="text-xs font-bold text-blue-800 uppercase tracking-wide">Selected</span><span id="selCount" class="text-lg font-extrabold text-blue-600">0</span></div>' +
                  '<h3 class="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Add External Source</h3>' +
                  '<div class="flex gap-2 mb-4"><input id="newSrc" class="flex-1 input-base px-3 py-2 rounded-xl text-xs font-mono" placeholder="https://.../plugins.json"><button onclick="App.addSource()" class="btn-primary px-3 py-2 rounded-xl text-xs font-bold">Add</button></div>' +
                  '<div id="sourceList" class="max-h-40 overflow-y-auto space-y-1 pr-1"></div>' +
               '</div>' +
            '</div>' +
            '<div class="flex-1">' +
               '<div class="bg-white p-2.5 rounded-2xl shadow-soft border border-gray-100 flex flex-col sm:flex-row gap-2 mb-4 sticky top-16 z-30">' +
                  '<input onkeyup="App.searchExt(this.value)" placeholder="Search plugins..." class="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium outline-none">' +
                  '<div class="flex gap-1 bg-gray-100 p-1 rounded-xl">' +
                     '<button id="f-all" onclick="App.setFilter(\\'all\\')" class="flex-1 sm:flex-none px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold transition">All</button>' +
                     '<button id="f-sfw" onclick="App.setFilter(\\'sfw\\')" class="flex-1 sm:flex-none px-4 py-1.5 text-gray-600 rounded-lg text-xs font-bold transition hover:bg-white hover:shadow-sm">SFW</button>' +
                     '<button id="f-nsfw" onclick="App.setFilter(\\'nsfw\\')" class="flex-1 sm:flex-none px-4 py-1.5 text-gray-600 rounded-lg text-xs font-bold transition hover:bg-white hover:shadow-sm">18+</button>' +
                  '</div>' +
               '</div>' +
               '<div id="extGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-10"></div>' +
            '</div>' +
            '</div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.init);
    </script>
</body>
</html>`;
