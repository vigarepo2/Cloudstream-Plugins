export const uiHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>My Extensions</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; color: #111827; -webkit-tap-highlight-color: transparent; }
        
        .card-shadow { box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03); }
        .input-field { background: #fff; border: 1px solid #e5e7eb; color: #111827; transition: all 0.2s; outline: none; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        
        .btn-blue { background: #2563eb; color: white; transition: all 0.2s; }
        .btn-blue:active { transform: scale(0.97); }
        .btn-blue:hover { background: #1d4ed8; }
        
        .ios-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .ios-switch input { opacity: 0; width: 0; height: 0; }
        .ios-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e5e7eb; transition: .3s; border-radius: 24px; }
        .ios-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        input:checked + .ios-slider { background-color: #34c759; }
        input:checked + .ios-slider:before { transform: translateX(20px); }

        #toast-box { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 60; display: flex; flex-direction: column; gap: 8px; width: 90%; max-w: 360px; }
        .toast { background: #1f2937; color: white; padding: 14px 20px; border-radius: 12px; font-weight: 500; font-size: 14px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); animation: slideDown 0.3s ease forwards; }
        .toast.error { background: #ef4444; }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .bottom-nav { position: fixed; bottom: 0; width: 100%; background: white; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-around; padding-bottom: env(safe-area-inset-bottom); z-index: 40; }
        .nav-item { padding: 16px; color: #9ca3af; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.2s; flex: 1; text-align: center; }
        .nav-item.active { color: #2563eb; }

        .loader { border: 3px solid #f3f4f6; border-top-color: #2563eb; border-radius: 50%; width: 20px; height: 20px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body class="pb-24">
    <div id="toast-box"></div>

    <nav class="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div class="max-w-4xl mx-auto px-5 h-16 flex justify-between items-center">
            <span class="font-bold text-xl text-gray-900 tracking-tight">Cloudstream</span>
            <span id="save-status" class="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full hidden">Saved</span>
        </div>
    </nav>

    <main id="app" class="max-w-4xl mx-auto px-4 py-8"></main>

    <div id="bottom-bar" class="bottom-nav hidden">
        <button onclick="App.go('home')" id="nav-home" class="nav-item active border-r border-gray-50">App Links</button>
        <button onclick="App.go('market')" id="nav-market" class="nav-item border-r border-gray-50">Extensions</button>
        <button onclick="App.go('settings')" id="nav-settings" class="nav-item">Settings</button>
    </div>

    <script>
      const App = {
        token: localStorage.getItem('cs_tok'),
        user: localStorage.getItem('cs_usr'),
        extensions: [],
        selected: new Set(),
        customLinks: [],
        isPublic: false,
        view: 'auth',
        search: '',
        filter: 'all',

        notify: (msg, isError = false) => {
          const box = document.getElementById('toast-box');
          const t = document.createElement('div');
          t.className = 'toast' + (isError ? ' error' : ''); t.innerText = msg;
          box.appendChild(t);
          setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
        },

        api: async (path, method = 'GET', body = null) => {
          const opts = { method, headers: { 'Content-Type': 'application/json' } };
          if (App.token) opts.headers['Authorization'] = App.token;
          if (body) opts.body = JSON.stringify(body);
          
          const res = await fetch(path, opts);
          const data = await res.json();
          if (!res.ok) {
            if (res.status === 401) { App.logout(); }
            throw new Error(data.error || 'Connection failed');
          }
          return data;
        },

        start: () => {
          if (App.token) {
            document.getElementById('bottom-bar').classList.remove('hidden');
            App.go('home');
            App.loadData();
          } else {
            document.getElementById('bottom-bar').classList.add('hidden');
            App.go('auth');
          }
        },

        logout: () => {
          localStorage.clear();
          App.token = null; App.user = null;
          App.start();
        },

        go: (page) => {
          App.view = page;
          if (page !== 'auth') {
            document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
            document.getElementById('nav-'+page).classList.add('active');
          }
          const root = document.getElementById('app');
          if (page === 'auth') root.innerHTML = App.screens.auth();
          if (page === 'home') { root.innerHTML = App.screens.home(); App.renderLinks(); }
          if (page === 'market') { root.innerHTML = App.screens.market(); App.drawGrid(); }
          if (page === 'settings') { root.innerHTML = App.screens.settings(); App.renderSettings(); }
        },

        auth: async (action) => {
          const u = document.getElementById('usr').value;
          const p = document.getElementById('pwd').value;
          if (!u || !p) return App.notify('Please fill both fields', true);
          
          const btn = document.getElementById('btn-auth');
          const oldText = btn.innerText;
          btn.innerHTML = '<div class="loader !border-white !border-t-transparent"></div>';
          
          try {
            const res = await App.api('/api/auth', 'POST', { action, username: u, password: p });
            localStorage.setItem('cs_tok', res.token);
            localStorage.setItem('cs_usr', res.username);
            App.token = res.token; App.user = res.username;
            App.notify('Success!');
            App.start();
          } catch (e) {
            btn.innerHTML = oldText;
            App.notify(e.message, true);
          }
        },

        loadData: async () => {
          try {
            const userState = await App.api('/api/user');
            App.selected = new Set(userState.selected);
            App.customLinks = userState.sources;
            App.isPublic = userState.isPublic;
            
            if (App.view === 'home') App.renderLinks();
            if (App.view === 'settings') App.renderSettings();
            
            App.extensions = await App.api('/api/extensions');
            if (App.view === 'market') App.drawGrid();
          } catch (e) {}
        },

        save: async () => {
          const s = document.getElementById('save-status');
          s.classList.remove('hidden');
          try {
            await App.api('/api/user', 'POST', { selected: Array.from(App.selected), sources: App.customLinks, isPublic: App.isPublic });
            setTimeout(() => s.classList.add('hidden'), 2000);
          } catch (e) { App.notify('Failed to save', true); s.classList.add('hidden'); }
        },

        toggle: (id) => {
          if (App.selected.has(id)) App.selected.delete(id);
          else App.selected.add(id);
          App.drawGrid(); App.save();
        },

        searchExt: (val) => { App.search = val.toLowerCase(); App.drawGrid(); },
        
        setFilter: (f) => {
          App.filter = f;
          ['all', 'safe', '18plus'].forEach(i => {
            const el = document.getElementById('f-'+i);
            if(f===i) el.classList.replace('bg-gray-100', 'bg-gray-900');
            if(f===i) el.classList.replace('text-gray-600', 'text-white');
            if(f!==i) el.classList.replace('bg-gray-900', 'bg-gray-100');
            if(f!==i) el.classList.replace('text-white', 'text-gray-600');
          });
          App.drawGrid();
        },

        renderLinks: () => {
          if(!App.token) return;
          const base = window.location.origin;
          const sfw = document.getElementById('link-safe');
          const nsfw = document.getElementById('link-18');
          if(sfw) sfw.value = base + '/' + App.token + '/safe/repo.json';
          if(nsfw) nsfw.value = base + '/' + App.token + '/18plus/repo.json';
        },

        drawGrid: () => {
          const grid = document.getElementById('grid');
          if (!grid) return;
          
          if (App.extensions.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-16 text-center"><div class="loader mb-4 border-gray-300 border-t-blue-600"></div><p class="text-gray-500 font-medium">Loading extensions...</p></div>';
            return;
          }

          let html = '';
          App.extensions.forEach(p => {
            const isAdult = p.tvTypes && p.tvTypes.some(t => t.toUpperCase() === 'NSFW');
            if (App.filter === 'safe' && isAdult) return;
            if (App.filter === '18plus' && !isAdult) return;
            if (App.search && !p.name.toLowerCase().includes(App.search)) return;
            
            const sel = App.selected.has(p.internalName);
            const img = p.iconUrl || p.icon ? '<img src="'+(p.iconUrl||p.icon)+'" class="w-14 h-14 rounded-2xl border border-gray-100 object-cover">' : '<div class="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">N/A</div>';
            const tag = isAdult ? '<span class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">18+</span>' : '<span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">SAFE</span>';

            html += '<div class="bg-white rounded-3xl p-4 card-shadow flex items-center justify-between transition-all '+(sel?'ring-2 ring-blue-500':'')+'" onclick="App.toggle(\\''+p.internalName+'\\')">';
            html += '<div class="flex items-center gap-4">'+img+'<div><h3 class="font-bold text-gray-900 text-sm mb-1 truncate w-40 sm:w-56">'+p.name+'</h3><div class="flex gap-2">'+tag+'<span class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">'+(p.language||'EN')+'</span></div></div></div>';
            html += '<div><label class="ios-switch pointer-events-none"><input type="checkbox" '+(sel?'checked':'')+'><span class="ios-slider"></span></label></div></div>';
          });
          grid.innerHTML = html || '<div class="col-span-full text-center text-gray-500 py-10 font-medium">No extensions matched your search.</div>';
        },

        copy: (id) => {
          const el = document.getElementById(id);
          navigator.clipboard.writeText(el.value);
          App.notify('Link copied to clipboard!');
        },

        addSource: () => {
          const val = document.getElementById('new-src').value.trim();
          if(!val.startsWith('http')) return App.notify('Please enter a valid link starting with http', true);
          App.customLinks.push(val);
          document.getElementById('new-src').value = '';
          App.save(); App.renderSettings();
        },
        
        removeSource: (i) => {
          App.customLinks.splice(i, 1);
          App.save(); App.renderSettings();
        },

        renderSettings: () => {
          const un = document.getElementById('user-name');
          const pub = document.getElementById('is-pub');
          if(un) un.innerText = App.user;
          if(pub) pub.checked = App.isPublic;
          
          const list = document.getElementById('src-list');
          if(!list) return;
          list.innerHTML = App.customLinks.map((s, i) => '<div class="flex justify-between items-center p-4 bg-gray-50 rounded-2xl mb-3 border border-gray-100"><span class="text-sm text-gray-600 truncate mr-4 font-medium">'+s+'</span><button onclick="App.removeSource('+i+')" class="text-red-500 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg">Remove</button></div>').join('') || '<p class="text-sm text-gray-500 text-center py-4">No custom links added yet.</p>';
        },

        screens: {
          auth: () => 
            '<div class="max-w-sm mx-auto mt-12"><div class="text-center mb-10"><div class="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"><svg viewBox="0 0 24 24" width="36" height="36" stroke="white" stroke-width="2.5" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1><p class="text-gray-500 mt-2 font-medium">Log in or create an account</p></div>' +
            '<div class="bg-white p-7 rounded-[32px] card-shadow space-y-5">' +
            '<div><label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 block mb-1.5">Username</label><input id="usr" class="w-full input-field px-4 py-3.5 rounded-2xl text-base font-medium" placeholder="yourname"></div>' +
            '<div><label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 block mb-1.5">Password</label><input id="pwd" type="password" class="w-full input-field px-4 py-3.5 rounded-2xl text-base font-medium" placeholder="••••••••"></div>' +
            '<div class="pt-2"><button id="btn-auth" onclick="App.auth(\\'login\\')" class="w-full btn-blue py-4 rounded-2xl text-base font-bold shadow-md shadow-blue-500/20">Log In</button></div>' +
            '<button onclick="App.auth(\\'signup\\')" class="w-full bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl text-base mt-3 hover:bg-gray-100 transition-colors">Create Account</button></div></div>',
            
          home: () => 
            '<div class="max-w-md mx-auto"><h2 class="text-2xl font-extrabold mb-6 text-gray-900">Your App Links</h2><p class="text-gray-500 mb-6 font-medium">Copy these links and paste them into the Cloudstream app to install your selected extensions.</p>' +
            '<div class="space-y-5">' +
            '<div class="bg-white p-6 rounded-3xl card-shadow"><div class="flex justify-between items-center mb-4"><span class="font-bold text-gray-900 text-lg">Safe Mode</span><button onclick="App.copy(\\'link-safe\\')" class="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition">Copy Link</button></div><input id="link-safe" readonly class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-500 font-medium outline-none"></div>' +
            '<div class="bg-white p-6 rounded-3xl card-shadow border-2 border-transparent hover:border-red-100 transition"><div class="flex justify-between items-center mb-4"><span class="font-bold text-red-600 text-lg">18+ Mode</span><button onclick="App.copy(\\'link-18\\')" class="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-200 transition">Copy Link</button></div><input id="link-18" readonly class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm text-gray-500 font-medium outline-none"></div>' +
            '</div></div>',

          market: () => 
            '<div><div class="sticky top-16 bg-[#f9fafb] pt-2 pb-4 z-30"><h2 class="text-2xl font-extrabold mb-4 text-gray-900">Extension Store</h2>' +
            '<div class="space-y-3"><input onkeyup="App.searchExt(this.value)" placeholder="Search extensions..." class="w-full input-field px-4 py-3.5 rounded-2xl text-base font-medium card-shadow">' +
            '<div class="flex gap-2"><button id="f-all" onclick="App.setFilter(\\'all\\')" class="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold transition">All</button><button id="f-safe" onclick="App.setFilter(\\'safe\\')" class="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-bold transition">Safe Only</button><button id="f-18plus" onclick="App.setFilter(\\'18plus\\')" class="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-bold transition">18+ Only</button></div></div></div>' +
            '<div id="grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[300px] mt-2"></div></div>',

          settings: () =>
            '<div class="max-w-md mx-auto"><h2 class="text-2xl font-extrabold mb-6 text-gray-900">Settings</h2>' +
            '<div class="bg-white p-6 rounded-3xl card-shadow mb-6"><div class="flex justify-between items-center mb-5"><div><span class="block font-bold text-gray-900 text-lg">Account</span><span id="user-name" class="text-sm text-gray-500 font-medium mt-1"></span></div><button onclick="App.logout()" class="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition">Log Out</button></div>' +
            '<div class="border-t border-gray-100 pt-5 mt-2 flex justify-between items-center"><div><span class="block font-bold text-gray-900 text-base">Public Link</span><p class="text-sm text-gray-500 font-medium mt-1">Let anyone use your links</p></div><label class="ios-switch"><input type="checkbox" id="is-pub" onchange="App.isPublic=this.checked;App.save()"><span class="ios-slider"></span></label></div></div>' +
            '<div class="bg-white p-6 rounded-3xl card-shadow"><h3 class="font-bold text-gray-900 text-lg mb-1">Add Custom Source</h3><p class="text-sm text-gray-500 font-medium mb-5">Paste a custom plugins.json link to get more extensions.</p>' +
            '<div class="flex gap-2 mb-6"><input id="new-src" class="flex-1 input-field px-4 py-3 rounded-2xl text-sm font-medium" placeholder="https://.../plugins.json"><button onclick="App.addSource()" class="bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold">Add</button></div>' +
            '<div id="src-list" class="space-y-3"></div></div></div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.start);
    </script>
</body>
</html>`;
