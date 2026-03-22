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
        
        .card-shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .input-field { background: #fff; border: 1px solid #e5e7eb; color: #111827; transition: border-color 0.2s; outline: none; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        
        .btn-blue { background: #2563eb; color: white; font-weight: 500; transition: background 0.2s; }
        .btn-blue:active { transform: scale(0.98); }
        .btn-blue:hover { background: #1d4ed8; }
        
        .ios-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .ios-switch input { opacity: 0; width: 0; height: 0; }
        .ios-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e5e7eb; transition: .3s; border-radius: 24px; }
        .ios-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        input:checked + .ios-slider { background-color: #34c759; }
        input:checked + .ios-slider:before { transform: translateX(20px); }

        #toast-box { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 50; display: flex; flex-direction: column; gap: 8px; width: 90%; max-w: 400px; }
        .toast { background: #1f2937; color: white; padding: 14px 20px; border-radius: 12px; font-weight: 500; font-size: 14px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); animation: slideUp 0.3s ease forwards; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .bottom-nav { position: fixed; bottom: 0; width: 100%; background: white; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-around; padding-bottom: env(safe-area-inset-bottom); z-index: 40; }
        .nav-item { padding: 16px; color: #6b7280; font-size: 12px; font-weight: 600; display: flex; flex-direction: column; items-center; gap: 4px; transition: color 0.2s; }
        .nav-item.active { color: #2563eb; }

        .loader { border: 3px solid #f3f4f6; border-top-color: #2563eb; border-radius: 50%; width: 24px; height: 24px; animation: spin 0.8s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body class="pb-24">
    <div id="toast-box"></div>

    <nav class="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div class="max-w-4xl mx-auto px-5 h-14 flex justify-between items-center">
            <span class="font-bold text-lg text-gray-900">Cloudstream Manager</span>
            <span id="save-status" class="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full hidden">Saved</span>
        </div>
    </nav>

    <main id="app" class="max-w-4xl mx-auto px-4 py-6"></main>

    <div id="bottom-bar" class="bottom-nav hidden">
        <button onclick="App.go('home')" id="nav-home" class="nav-item active w-full flex items-center justify-center">Extensions</button>
        <button onclick="App.go('settings')" id="nav-settings" class="nav-item w-full flex items-center justify-center border-l border-gray-100">Settings</button>
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

        notify: (msg) => {
          const box = document.getElementById('toast-box');
          const t = document.createElement('div');
          t.className = 'toast'; t.innerText = msg;
          box.appendChild(t);
          setTimeout(() => t.remove(), 2500);
        },

        api: async (path, method = 'GET', body = null) => {
          const opts = { method, headers: { 'Content-Type': 'application/json' } };
          if (App.token) opts.headers['Authorization'] = App.token;
          if (body) opts.body = JSON.stringify(body);
          
          const res = await fetch(path, opts);
          const data = await res.json();
          if (!res.ok) {
            if (res.status === 401) { App.logout(); }
            throw new Error(data.error || 'Something went wrong');
          }
          return data;
        },

        start: () => {
          if (App.token) {
            document.getElementById('bottom-bar').classList.remove('hidden');
            App.go('home');
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
          if (page === 'home') { root.innerHTML = App.screens.home(); App.loadData(); }
          if (page === 'settings') { root.innerHTML = App.screens.settings(); App.renderSettings(); }
        },

        auth: async (action) => {
          const u = document.getElementById('usr').value;
          const p = document.getElementById('pwd').value;
          if (!u || !p) return App.notify('Please fill all fields');
          
          document.getElementById('btn-auth').innerHTML = '<div class="loader !w-5 !h-5 !border-2"></div>';
          try {
            const res = await App.api('/api/auth', 'POST', { action, username: u, password: p });
            localStorage.setItem('cs_tok', res.token);
            localStorage.setItem('cs_usr', res.username);
            App.token = res.token; App.user = res.username;
            App.notify('Welcome!');
            App.start();
          } catch (e) {
            App.notify(e.message);
            App.go('auth');
          }
        },

        loadData: async () => {
          try {
            const userState = await App.api('/api/user');
            App.selected = new Set(userState.selected);
            App.customLinks = userState.sources;
            App.isPublic = userState.isPublic;
            
            const base = window.location.origin;
            document.getElementById('link-safe').value = base + '/' + App.token + '/safe/repo.json';
            document.getElementById('link-18').value = base + '/' + App.token + '/18plus/repo.json';
            
            document.getElementById('grid').innerHTML = '<div class="col-span-full py-10"><div class="loader"></div><p class="text-center text-gray-400 text-sm mt-3">Finding extensions...</p></div>';
            
            App.extensions = await App.api('/api/extensions');
            App.drawGrid();
          } catch (e) {}
        },

        save: async () => {
          const s = document.getElementById('save-status');
          s.innerText = 'Saving...'; s.classList.remove('hidden');
          try {
            await App.api('/api/user', 'POST', { selected: Array.from(App.selected), sources: App.customLinks, isPublic: App.isPublic });
            s.innerText = 'Saved';
            setTimeout(() => s.classList.add('hidden'), 2000);
          } catch (e) { s.innerText = 'Error'; }
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
            if(f===i) el.classList.replace('bg-gray-100', 'bg-blue-600');
            if(f===i) el.classList.replace('text-gray-600', 'text-white');
            if(f!==i) el.classList.replace('bg-blue-600', 'bg-gray-100');
            if(f!==i) el.classList.replace('text-white', 'text-gray-600');
          });
          App.drawGrid();
        },

        drawGrid: () => {
          let html = '';
          App.extensions.forEach(p => {
            const isAdult = p.tvTypes && p.tvTypes.some(t => t.toUpperCase() === 'NSFW');
            if (App.filter === 'safe' && isAdult) return;
            if (App.filter === '18plus' && !isAdult) return;
            if (App.search && !p.name.toLowerCase().includes(App.search)) return;
            
            const sel = App.selected.has(p.internalName);
            const img = p.iconUrl || p.icon ? '<img src="'+(p.iconUrl||p.icon)+'" class="w-12 h-12 rounded-xl border border-gray-100 object-cover bg-white">' : '<div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">No Icon</div>';
            const tag = isAdult ? '<span class="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-bold">18+</span>' : '<span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-[10px] font-bold">SAFE</span>';

            html += '<div class="bg-white rounded-2xl p-4 card-shadow flex items-center justify-between '+(sel?'border-2 border-blue-500':'border border-white')+'" onclick="App.toggle(\\''+p.internalName+'\\')">';
            html += '<div class="flex items-center gap-4">'+img+'<div><h3 class="font-bold text-gray-900 text-sm mb-1 truncate max-w-[160px] sm:max-w-xs">'+p.name+'</h3><div class="flex gap-2">'+tag+'<span class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">'+(p.language||'EN')+'</span></div></div></div>';
            html += '<div><label class="ios-switch pointer-events-none"><input type="checkbox" '+(sel?'checked':'')+'><span class="ios-slider"></span></label></div></div>';
          });
          document.getElementById('grid').innerHTML = html || '<div class="col-span-full text-center text-gray-500 py-10">No extensions found.</div>';
        },

        copy: (id) => {
          const el = document.getElementById(id);
          navigator.clipboard.writeText(el.value);
          App.notify('Link copied!');
        },

        addSource: () => {
          const val = document.getElementById('new-src').value.trim();
          if(!val.startsWith('http')) return App.notify('Must be a valid link');
          App.customLinks.push(val);
          document.getElementById('new-src').value = '';
          App.save(); App.renderSettings();
        },
        
        removeSource: (i) => {
          App.customLinks.splice(i, 1);
          App.save(); App.renderSettings();
        },

        renderSettings: () => {
          document.getElementById('user-name').innerText = App.user;
          document.getElementById('is-pub').checked = App.isPublic;
          const list = document.getElementById('src-list');
          list.innerHTML = App.customLinks.map((s, i) => '<div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2"><span class="text-xs text-gray-600 truncate mr-3">'+s+'</span><button onclick="App.removeSource('+i+')" class="text-red-500 text-xs font-bold">Remove</button></div>').join('') || '<p class="text-sm text-gray-500">No extra sources added.</p>';
        },

        screens: {
          auth: () => 
            '<div class="max-w-sm mx-auto mt-10"><div class="text-center mb-8"><div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 card-shadow"><svg viewBox="0 0 24 24" width="32" height="32" stroke="white" stroke-width="2.5" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><h1 class="text-2xl font-bold text-gray-900">Welcome</h1><p class="text-gray-500 mt-1">Sign in to manage your extensions</p></div>' +
            '<div class="bg-white p-6 rounded-3xl card-shadow space-y-4">' +
            '<div><label class="text-xs font-semibold text-gray-600 uppercase ml-1 block mb-1">Username</label><input id="usr" class="w-full input-field px-4 py-3 rounded-xl text-sm" placeholder="yourname"></div>' +
            '<div><label class="text-xs font-semibold text-gray-600 uppercase ml-1 block mb-1">Password</label><input id="pwd" type="password" class="w-full input-field px-4 py-3 rounded-xl text-sm" placeholder="••••••••"></div>' +
            '<button id="btn-auth" onclick="App.auth(\\'login\\')" class="w-full btn-blue py-3.5 rounded-xl text-sm font-semibold mt-2">Log In</button>' +
            '<button onclick="App.auth(\\'signup\\')" class="w-full bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl text-sm mt-2 hover:bg-gray-100">Create Account</button></div></div>',
            
          home: () => 
            '<div><h2 class="text-lg font-bold mb-3 text-gray-900">Your App Links</h2>' +
            '<div class="space-y-3 mb-8">' +
            '<div class="bg-white p-4 rounded-2xl card-shadow"><div class="flex justify-between items-center mb-3"><span class="font-bold text-sm">Safe Extensions</span><button onclick="App.copy(\\'link-safe\\')" class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold">Copy Link</button></div><input id="link-safe" readonly class="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-500 outline-none"></div>' +
            '<div class="bg-white p-4 rounded-2xl card-shadow"><div class="flex justify-between items-center mb-3"><span class="font-bold text-sm">18+ Extensions</span><button onclick="App.copy(\\'link-18\\')" class="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold">Copy Link</button></div><input id="link-18" readonly class="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-500 outline-none"></div>' +
            '</div>' +
            '<h2 class="text-lg font-bold mb-3 text-gray-900">All Extensions</h2>' +
            '<div class="mb-4 space-y-3"><input onkeyup="App.searchExt(this.value)" placeholder="Search for an extension..." class="w-full input-field px-4 py-3 rounded-xl text-sm card-shadow">' +
            '<div class="flex gap-2"><button id="f-all" onclick="App.setFilter(\\'all\\')" class="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold transition">All</button><button id="f-safe" onclick="App.setFilter(\\'safe\\')" class="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold transition">Safe</button><button id="f-18plus" onclick="App.setFilter(\\'18plus\\')" class="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold transition">18+</button></div></div>' +
            '<div id="grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[300px]"></div></div>',

          settings: () =>
            '<div><h2 class="text-2xl font-bold mb-6 text-gray-900">Settings</h2>' +
            '<div class="bg-white p-5 rounded-2xl card-shadow mb-6"><div class="flex justify-between items-center mb-4"><div><span class="block font-bold text-gray-900">Account</span><span id="user-name" class="text-sm text-gray-500"></span></div><button onclick="App.logout()" class="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold">Log Out</button></div>' +
            '<div class="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center"><div><span class="block font-bold text-gray-900 text-sm">Public Link</span><p class="text-xs text-gray-500">Let others use your link</p></div><label class="ios-switch"><input type="checkbox" id="is-pub" onchange="App.isPublic=this.checked;App.save()"><span class="ios-slider"></span></label></div></div>' +
            '<div class="bg-white p-5 rounded-2xl card-shadow"><h3 class="font-bold text-gray-900 mb-1">Add Custom Source</h3><p class="text-xs text-gray-500 mb-4">Paste a custom plugins.json link here.</p>' +
            '<div class="flex gap-2 mb-5"><input id="new-src" class="flex-1 input-field px-3 py-2.5 rounded-xl text-sm" placeholder="https://.../plugins.json"><button onclick="App.addSource()" class="btn-blue px-4 py-2.5 rounded-xl text-xs font-bold">Add</button></div>' +
            '<div id="src-list"></div></div></div>'
        }
      };
      
      document.addEventListener("DOMContentLoaded", App.start);
    </script>
</body>
</html>`;
