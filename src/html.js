export const uiTemplate = `<!DOCTYPE html>
<html lang="en" class="bg-black text-white">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Aether | Deploy Architecture</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .card { background: #0a0a0a; border: 1px solid #222; transition: border-color 0.15s ease; }
        .card:hover { border-color: #444; }
        .btn-primary { background: #ededed; color: #000; border: 1px solid transparent; transition: 0.15s; }
        .btn-primary:hover { background: #fff; transform: scale(0.98); }
        .btn-secondary { background: #000; border: 1px solid #333; color: #ededed; transition: 0.15s; }
        .btn-secondary:hover { background: #111; border-color: #555; }
        .input-box { background: #000; border: 1px solid #333; color: #ededed; outline: none; transition: 0.15s; }
        .input-box:focus { border-color: #888; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .loader { border: 2px solid #333; border-top-color: #fff; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        /* Minimal Switch */
        .switch { position: relative; display: inline-block; width: 36px; height: 20px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #222; transition: .2s; border-radius: 20px; border: 1px solid #333; }
        .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: #666; transition: .2s; border-radius: 50%; }
        input:checked + .slider { background-color: #ededed; border-color: #ededed; }
        input:checked + .slider:before { transform: translateX(16px); background-color: #000; }
    </style>
</head>
<body class="min-h-screen flex flex-col pb-10">

    <nav class="border-b border-[#222] bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="text-white"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                <span class="font-bold text-sm tracking-widest uppercase">Aether</span>
            </div>
            
            <div id="syncStatus" class="hidden items-center gap-2 px-3 py-1 rounded-full border border-[#222] bg-[#111] text-[10px] font-mono text-[#888]">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> SYNCED
            </div>

            <div id="desktopNav" class="flex items-center gap-4"></div>
        </div>
    </nav>

    <main id="app" class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8"></main>

    <script>
      const App = {
        token: localStorage.getItem('cs_token'),
        email: localStorage.getItem('cs_email'),
        data: null, plugins: [], selected: new Set(), sources: [], isPublic: false,
        filters: { search: '', type: 'all', author: 'all' },
        authorsList: [],
        authStep: 1, authAction: 'login',
        
        req: async function(path, method, body) {
          const h = { 'Content-Type': 'application/json' };
          if (this.token) h['Authorization'] = this.token;
          const o = { method: method || 'GET', headers: h };
          if (body) o.body = JSON.stringify(body);
          
          const r = await fetch(path, o);
          if (!r.ok) {
            if (r.status === 401 || r.status === 403) this.logout();
            const errData = await r.json().catch(() => ({error: 'Server Error'}));
            throw new Error(errData.error || 'Server Error');
          }
          return r.json();
        },

        logout: function() {
          localStorage.clear();
          this.token = null; this.email = null; this.render();
        },

        init: function() { this.render(); },

        render: function() {
          const dNav = document.getElementById('desktopNav');
          const app = document.getElementById('app');
          const sync = document.getElementById('syncStatus');
          
          if (!this.token) {
            dNav.innerHTML = ''; sync.style.display = 'none';
            app.innerHTML = this.views.auth();
          } else {
            dNav.innerHTML = '<button onclick="App.setView(\\'dashboard\\')" class="text-[11px] font-mono hover:text-white text-[#888] transition uppercase">Workspace</button>' +
                             '<button onclick="App.setView(\\'settings\\')" class="text-[11px] font-mono hover:text-white text-[#888] transition uppercase">Settings</button>' +
                             '<button onclick="App.logout()" class="ml-2 px-3 py-1.5 text-[11px] font-mono btn-secondary rounded-md uppercase">Sign Out</button>';
            sync.style.display = 'flex';
            if(!this.view) this.view = 'dashboard';
            
            if (this.view === 'dashboard') { app.innerHTML = this.views.dashboard(); this.loadDash(); }
            if (this.view === 'settings') { app.innerHTML = this.views.settings(); this.loadSettings(); }
          }
        },

        setView: function(v) { this.view = v; this.render(); },

        toggleAuthMode: function() {
            this.authAction = this.authAction === 'login' ? 'signup' : 'login';
            this.render(); 
        },

        handleAuth: async function() {
          const e = document.getElementById('email').value;
          const p = document.getElementById('pass').value;
          const btn = document.getElementById('authBtn');
          const err = document.getElementById('err');
          
          if(!e || !p) { err.innerText = "Email and Password required."; err.style.display = 'block'; return; }
          
          btn.innerHTML = '<div class="loader mx-auto"></div>'; err.style.display = 'none';
          
          try {
            if(this.authStep === 1) {
                const res = await this.req('/api/auth', 'POST', { action: this.authAction, email: e, password: p });
                if(this.authAction === 'signup') {
                    this.authStep = 2;
                    document.getElementById('otpArea').style.display = 'block';
                    document.getElementById('authModeToggle').style.display = 'none';
                    btn.innerHTML = 'Verify OTP';
                } else {
                    localStorage.setItem('cs_token', res.token);
                    localStorage.setItem('cs_email', e);
                    this.token = res.token; this.email = e; this.render();
                }
            } else {
                const o = document.getElementById('otp').value;
                if(!o) throw new Error("OTP is required");
                const res = await this.req('/api/auth', 'POST', { action: 'verify', email: e, password: p, otp: o });
                localStorage.setItem('cs_token', res.token);
                localStorage.setItem('cs_email', e);
                this.token = res.token; this.email = e; this.render();
            }
          } catch(error) {
            err.innerText = error.message || "Action failed."; err.style.display = 'block';
            btn.innerHTML = this.authStep === 1 ? (this.authAction === 'login' ? 'Sign In' : 'Send Code') : 'Verify OTP';
          }
        },

        loadDash: async function() {
          try {
            this.data = await this.req('/api/me');
            this.selected = new Set(this.data.config.selected);
            this.sources = this.data.config.sources;
            this.isPublic = this.data.config.is_public;
            
            const b = window.location.origin;
            document.getElementById('link-sfw').value = b + '/' + this.data.user.token + '/sfw/repo.json';
            document.getElementById('link-nsfw').value = b + '/' + this.data.user.token + '/nsfw/repo.json';
            
            await this.fetchNetwork();
          } catch(e) {}
        },

        fetchNetwork: async function() {
          document.getElementById('loaderArea').style.display = 'flex';
          try {
            this.plugins = await this.req('/api/explore');
            this.extractAuthors();
            this.renderFilters();
            this.renderGrid();
          } catch(e) {
            document.getElementById('grid').innerHTML = '<div class="col-span-full p-6 text-center border border-[#333] text-rose-500 rounded-xl font-mono text-sm">Failed to connect to edge network.</div>';
          } finally { document.getElementById('loaderArea').style.display = 'none'; }
        },

        extractAuthors: function() {
          const authSet = new Set();
          this.plugins.forEach(p => {
            let author = Array.isArray(p.authors) ? p.authors[0] : p.authors;
            if (author) authSet.add(author.trim());
          });
          this.authorsList = Array.from(authSet).sort();
        },

        syncChanges: async function() {
          const sync = document.getElementById('syncStatus');
          sync.innerHTML = '<div class="loader !w-2 !h-2 !border-2 mx-1"></div> <span class="text-white">SAVING</span>';
          try {
            await this.req('/api/me/sync', 'POST', { selected: Array.from(this.selected), sources: this.sources, is_public: this.isPublic });
            sync.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> SYNCED';
          } catch(e) { sync.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div> ERR'; }
        },

        togglePlugin: function(id) {
          if (this.selected.has(id)) this.selected.delete(id);
          else this.selected.add(id);
          this.renderGrid(); this.syncChanges();
        },

        handleSearch: function(val) { this.filters.search = val.toLowerCase(); this.renderGrid(); },
        setType: function(type) { 
          this.filters.type = type; 
          ['all','sfw','nsfw'].forEach(t => {
            const el = document.getElementById('btn-'+t);
            if(t===type) { el.classList.add('bg-white', 'text-black'); el.classList.remove('text-[#888]', 'hover:text-white'); }
            else { el.classList.remove('bg-white', 'text-black'); el.classList.add('text-[#888]', 'hover:text-white'); }
          });
          this.renderGrid(); 
        },
        setAuthor: function(val) { this.filters.author = val; this.renderGrid(); },

        renderFilters: function() {
          const select = document.getElementById('authorSelect');
          select.innerHTML = '<option value="all">All Sources</option>' + this.authorsList.map(a => '<option value="'+a+'">'+a+'</option>').join('');
        },

        renderGrid: function() {
          const g = document.getElementById('grid');
          let h = "";
          
          for(let i=0; i<this.plugins.length; i++) {
            const p = this.plugins[i];
            const isNsfw = p.tvTypes && p.tvTypes.some(t => t.toUpperCase() === 'NSFW');
            const author = Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'Unknown');
            
            if (this.filters.type === 'sfw' && isNsfw) continue;
            if (this.filters.type === 'nsfw' && !isNsfw) continue;
            if (this.filters.author !== 'all' && author !== this.filters.author) continue;
            if (this.filters.search && p.name.toLowerCase().indexOf(this.filters.search) === -1 && p.internalName.toLowerCase().indexOf(this.filters.search) === -1) continue;
            
            const sel = this.selected.has(p.internalName);
            const icon = p.iconUrl || p.icon || "";
            const iconEl = icon ? '<img src="'+icon+'" class="w-10 h-10 rounded border border-[#222] object-cover">' : '<div class="w-10 h-10 rounded bg-[#111] border border-[#222] flex items-center justify-center font-bold text-[#444] text-xs">?</div>';
            
            const tagHtml = isNsfw 
                ? '<span class="text-[9px] font-mono border border-rose-500/30 text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">18+ NSFW</span>' 
                : '<span class="text-[9px] font-mono border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">SFW</span>';
            const langHtml = '<span class="text-[9px] font-mono border border-[#333] text-[#888] px-1.5 py-0.5 rounded uppercase">' + (p.language||'EN') + '</span>';

            h += '<div class="card rounded-xl p-4 flex flex-col cursor-pointer '+(sel?'border-[#fff]':'')+'" onclick="App.togglePlugin(\\''+p.internalName+'\\')">';
            h += '<div class="flex items-start gap-3 mb-4">' + iconEl;
            h += '<div class="flex-1 min-w-0"><h3 class="font-semibold text-sm text-[#ededed] truncate">' + p.name + '</h3>';
            h += '<div class="flex items-center gap-1.5 mt-1.5">' + tagHtml + langHtml + '</div></div>';
            h += '<div class="ml-2"><label class="switch pointer-events-none"><input type="checkbox" '+(sel?'checked':'')+'><span class="slider"></span></label></div></div>';
            h += '<div class="flex justify-between items-end mt-auto pt-3 border-t border-[#222]">';
            h += '<p class="text-[10px] font-mono text-[#555]">v' + (p.version||1) + '</p>';
            h += '<span class="text-[10px] font-mono text-[#666] truncate max-w-[100px] block" title="'+author+'">' + author + '</span></div></div>';
          }
          
          g.innerHTML = h || '<div class="col-span-full py-12 text-center text-[#555] font-mono text-sm border border-[#222] rounded-xl border-dashed">No deployments found.</div>';
          document.getElementById('selCount').innerText = this.selected.size;
        },

        loadSettings: async function() {
          try {
            this.data = await this.req('/api/me');
            this.sources = this.data.config.sources;
            this.isPublic = this.data.config.is_public;
            
            document.getElementById('userEmail').innerText = this.email;
            document.getElementById('userToken').innerText = this.data.user.token;
            document.getElementById('publicToggle').checked = this.isPublic;
            
            const b = window.location.origin;
            const publicLink = b + '/' + this.data.user.token + '/sfw/repo.json';
            document.getElementById('publicLink').innerText = publicLink;
            
            this.renderSources();
          } catch(e) {}
        },

        renderSources: function() {
          const list = document.getElementById('customSourcesList');
          list.innerHTML = this.sources.map((s, i) => 
            '<div class="flex justify-between items-center border border-[#333] bg-[#0a0a0a] p-3 rounded-lg"><span class="text-xs font-mono text-[#aaa] truncate mr-4">' + s + '</span><button onclick="App.removeSource('+i+')" class="text-rose-500 hover:text-rose-400 text-xs font-mono uppercase">Remove</button></div>'
          ).join('') || '<p class="text-xs font-mono text-[#555]">No custom data sources.</p>';
        },

        addSource: function() {
          const i = document.getElementById('newSrc');
          if(!i.value.startsWith('http')) return;
          this.sources.push(i.value); i.value = '';
          this.syncChanges(); this.renderSources();
        },
        removeSource: function(idx) {
          this.sources.splice(idx, 1);
          this.syncChanges(); this.renderSources();
        },
        togglePublic: function() {
          this.isPublic = !this.isPublic;
          this.syncChanges();
        },

        copy: function(id) {
          const el = document.getElementById(id);
          navigator.clipboard.writeText(el.value || el.innerText);
          alert('Copied to clipboard.');
        },
        share: function(id) {
          const val = document.getElementById(id).value;
          if (navigator.share) navigator.share({ url: val });
          else this.copy(id);
        },

        views: {
          auth: () => 
            '<div class="max-w-sm mx-auto mt-16 sm:mt-24"><div class="text-center mb-8"><svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="2" fill="none" class="text-white mx-auto mb-4"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>' +
            '<h1 id="authTitle" class="text-2xl font-semibold tracking-tight">' + (App.authAction==='login'?'Sign In':'Create Workspace') + '</h1><p class="text-sm text-[#888] mt-2">Deploy your streaming architecture.</p></div>' +
            '<div class="card p-6 rounded-xl space-y-4"><div class="space-y-1"><label class="text-[10px] font-mono text-[#888] uppercase">Email Address</label><input id="email" type="email" class="w-full input-box p-3 rounded-lg text-sm" placeholder="you@domain.com"></div>' +
            '<div class="space-y-1"><label class="text-[10px] font-mono text-[#888] uppercase">Password</label><input id="pass" type="password" class="w-full input-box p-3 rounded-lg text-sm" placeholder="••••••••"></div>' +
            '<div id="otpArea" style="display:none" class="space-y-1 pt-2 border-t border-[#333]"><label class="text-[10px] font-mono text-emerald-400 uppercase">Verification Code Sent</label><input id="otp" type="text" class="w-full input-box p-3 rounded-lg text-sm font-mono tracking-widest text-center" placeholder="123456"></div>' +
            '<div id="err" class="text-rose-500 text-xs font-mono mt-2" style="display:none"></div>' +
            '<button id="authBtn" onclick="App.handleAuth()" class="w-full btn-primary py-3 rounded-lg text-sm font-semibold mt-4">Sign In</button></div>' +
            '<div class="text-center mt-6"><p id="authModeToggle" onclick="App.toggleAuthMode()" class="text-xs text-[#888] cursor-pointer hover:text-white transition">' + (App.authAction==='login'?'Need an account? Sign up':'Have an account? Sign in') + '</p></div></div>',
          
          dashboard: () => 
            '<div class="mb-10"><h1 class="text-xl font-semibold tracking-tight mb-4">Deployments</h1><div class="grid md:grid-cols-2 gap-4">' +
            '<div class="card p-5 rounded-xl"><div class="flex justify-between items-center mb-4"><h3 class="text-sm font-medium flex items-center gap-2"><div class="w-2 h-2 bg-emerald-500 rounded-full"></div> SFW Edge</h3><div class="flex gap-2"><button onclick="App.copy(\\'link-sfw\\')" class="btn-secondary px-3 py-1 rounded text-xs font-mono uppercase">Copy</button><button onclick="App.share(\\'link-sfw\\')" class="btn-primary px-3 py-1 rounded text-xs font-mono uppercase">Share</button></div></div><input id="link-sfw" readonly class="w-full bg-transparent text-[11px] font-mono text-[#888] outline-none truncate"></div>' +
            '<div class="card p-5 rounded-xl"><div class="flex justify-between items-center mb-4"><h3 class="text-sm font-medium flex items-center gap-2"><div class="w-2 h-2 bg-rose-500 rounded-full"></div> NSFW Edge</h3><div class="flex gap-2"><button onclick="App.copy(\\'link-nsfw\\')" class="btn-secondary px-3 py-1 rounded text-xs font-mono uppercase">Copy</button><button onclick="App.share(\\'link-nsfw\\')" class="btn-primary px-3 py-1 rounded text-xs font-mono uppercase">Share</button></div></div><input id="link-nsfw" readonly class="w-full bg-transparent text-[11px] font-mono text-[#888] outline-none truncate"></div>' +
            '</div></div>' +

            '<div><div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">' +
            '<div><h2 class="text-lg font-semibold">Integrations</h2><p class="text-sm text-[#888]">Toggle modules to sync with edge API.</p></div>' +
            '<div class="flex gap-3 w-full md:w-auto"><input onkeyup="App.handleSearch(this.value)" placeholder="Search..." class="input-box px-3 py-2 rounded-lg text-sm w-full sm:w-48"><select id="authorSelect" onchange="App.setAuthor(this.value)" class="input-box px-2 py-2 rounded-lg text-sm cursor-pointer"></select></div></div>' +
            
            '<div class="flex items-center justify-between mb-4"><div class="flex gap-2">' +
            '<button id="btn-all" onclick="App.setType(\\'all\\')" class="px-3 py-1.5 rounded-md text-[11px] font-mono uppercase bg-white text-black transition">All</button>' +
            '<button id="btn-sfw" onclick="App.setType(\\'sfw\\')" class="px-3 py-1.5 rounded-md text-[11px] font-mono uppercase text-[#888] hover:text-white transition">SFW</button>' +
            '<button id="btn-nsfw" onclick="App.setType(\\'nsfw\\')" class="px-3 py-1.5 rounded-md text-[11px] font-mono uppercase text-[#888] hover:text-white transition">NSFW</button>' +
            '</div><span class="text-[10px] font-mono text-[#888] border border-[#333] px-2 py-1 rounded-md"><span id="selCount" class="text-white">0</span> SEL</span></div>' +
            
            '<div class="relative min-h-[40vh]"><div id="loaderArea" class="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center gap-3"><div class="loader"></div></div>' +
            '<div id="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div></div></div>',
            
          settings: () =>
            '<div class="max-w-2xl"><h1 class="text-xl font-semibold tracking-tight mb-8">Settings</h1>' +
            
            '<div class="mb-10"><h2 class="text-xs font-mono text-[#888] uppercase mb-3">Authentication</h2><div class="card p-5 rounded-xl">' +
            '<div class="flex justify-between items-center mb-6"><span class="text-sm text-[#aaa]">Email</span><span id="userEmail" class="text-sm font-medium text-white"></span></div>' +
            '<div class="flex justify-between items-center pt-6 border-t border-[#222]"><div class="pr-4"><span class="text-sm text-white block mb-1">Access Token</span><p id="userToken" class="text-[11px] text-[#888] font-mono truncate max-w-[200px] sm:max-w-xs"></p></div>' +
            '<button class="btn-secondary text-rose-500 hover:text-rose-400 text-[10px] font-mono px-3 py-2 rounded-lg uppercase">Revoke</button></div></div></div>' +
            
            '<div class="mb-10"><h2 class="text-xs font-mono text-[#888] uppercase mb-3">Public Sharing</h2><div class="card p-5 rounded-xl">' +
            '<div class="flex justify-between items-center mb-4"><div><span class="text-sm text-white block mb-1">Allow Public Access</span><p class="text-xs text-[#888]">Anyone with the link can install your repository.</p></div>' +
            '<label class="switch"><input type="checkbox" id="publicToggle" onchange="App.togglePublic()"><span class="slider"></span></label></div>' +
            '<div class="p-3 bg-[#000] border border-[#333] rounded-lg flex justify-between items-center"><code id="publicLink" class="text-[10px] font-mono text-[#555] truncate"></code><button onclick="App.copy(\\'publicLink\\')" class="text-[10px] font-mono text-[#888] hover:text-white uppercase ml-4">Copy</button></div></div></div>' +

            '<div class="mb-10"><h2 class="text-xs font-mono text-[#888] uppercase mb-3">Custom Data Nodes</h2><div class="card p-5 rounded-xl">' +
            '<div class="flex gap-2 mb-4"><input id="newSrc" class="input-box flex-1 rounded-lg px-3 py-2 text-sm" placeholder="https://raw.../plugins.json"><button onclick="App.addSource()" class="btn-primary px-4 py-2 rounded-lg text-xs font-mono uppercase">Add</button></div>' +
            '<div id="customSourcesList" class="space-y-2"></div></div></div>' +
            '</div>'
        }
      };

      document.addEventListener("DOMContentLoaded", () => App.init());
    </script>
</body>
</html>`;
