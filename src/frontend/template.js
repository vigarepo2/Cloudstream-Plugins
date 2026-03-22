export const uiTemplate = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Aether | Console</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
            colors: {
              base: '#030303', surface: '#0a0a0a', surfaceHover: '#121212',
              borderLight: '#1f1f1f', borderHighlight: '#333333',
              accent: '#f4f4f5', accentDim: '#a1a1aa'
            },
            animation: { 'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', 'slide-up': 'slideUp 0.3s ease-out forwards' },
            keyframes: { slideUp: { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } } }
          }
        }
      }
    </script>
    <style>
        body { background-color: #030303; color: #f4f4f5; -webkit-tap-highlight-color: transparent; overflow-x: hidden; }
        
        .bg-mesh {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1;
            background-image: 
                radial-gradient(at 40% 20%, rgba(255, 255, 255, 0.03) 0px, transparent 50%),
                radial-gradient(at 80% 0%, rgba(255, 255, 255, 0.02) 0px, transparent 50%),
                radial-gradient(at 0% 50%, rgba(255, 255, 255, 0.02) 0px, transparent 50%);
            filter: blur(40px);
        }

        .glass-panel {
            background: rgba(10, 10, 10, 0.6);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid #1f1f1f;
            box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.5);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-panel:hover { border-color: #333333; transform: translateY(-2px); }

        .input-node {
            background: #000; border: 1px solid #1f1f1f; color: #f4f4f5;
            transition: all 0.2s ease; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .input-node:focus { border-color: #f4f4f5; box-shadow: 0 0 0 1px #f4f4f5, inset 0 2px 4px rgba(0,0,0,0.2); }

        .btn-core {
            background: #f4f4f5; color: #030303; font-weight: 600; border: none;
            transition: transform 0.2s, background 0.2s;
        }
        .btn-core:hover { background: #ffffff; transform: scale(0.98); }
        .btn-core:active { transform: scale(0.95); }

        .btn-outline {
            background: transparent; border: 1px solid #333333; color: #a1a1aa; transition: all 0.2s;
        }
        .btn-outline:hover { background: #0a0a0a; color: #f4f4f5; border-color: #f4f4f5; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333333; border-radius: 8px; }

        .spinner {
            border: 2px solid rgba(255,255,255,0.1); border-left-color: #f4f4f5;
            border-radius: 50%; width: 16px; height: 16px; animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider-round { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #1f1f1f; transition: .3s; border-radius: 20px; border: 1px solid #333333; }
        .slider-round:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: #a1a1aa; transition: .3s; border-radius: 50%; }
        input:checked + .slider-round { background-color: #f4f4f5; border-color: #f4f4f5; }
        input:checked + .slider-round:before { transform: translateX(16px); background-color: #030303; }

        #toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
        .toast { background: #f4f4f5; color: #030303; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .toast.error { background: #ef4444; color: white; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(10px); } }

        .skeleton { background: linear-gradient(90deg, #0a0a0a 25%, #121212 50%, #0a0a0a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    </style>
</head>
<body class="min-h-screen flex flex-col pb-16 selection:bg-white selection:text-black">
    <div class="bg-mesh"></div>
    <div id="toast-container"></div>

    <nav class="border-b border-borderLight bg-base/80 backdrop-blur-xl sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded bg-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="black" stroke-width="3" fill="none"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                </div>
                <span class="font-bold text-sm tracking-widest uppercase text-accent">AETHER CORE</span>
            </div>
            <div id="statusIndicator" class="hidden items-center gap-2 px-3 py-1.5 rounded bg-surface border border-borderLight text-[10px] font-mono text-accentDim uppercase tracking-wider"></div>
            <div id="navigationNodes" class="flex items-center gap-2"></div>
        </div>
    </nav>

    <main id="applicationRoot" class="flex-1 max-w-7xl mx-auto w-full px-6 py-12"></main>

    <script>
      class ToastManager {
        static show(message, type = 'success') {
          const container = document.getElementById('toast-container');
          const toast = document.createElement('div');
          toast.className = \`toast \${type}\`;
          toast.innerText = message;
          container.appendChild(toast);
          setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }
      }

      class NetworkEngine {
        static async transmit(endpoint, method = 'GET', payload = null) {
          const headers = { 'Content-Type': 'application/json' };
          const token = StateManager.get('token');
          if (token) headers['Authorization'] = token;
          
          const config = { method, headers };
          if (payload) config.body = JSON.stringify(payload);
          
          try {
            const response = await fetch(endpoint, config);
            const data = await response.json();
            
            if (!response.ok) {
              if (response.status === 401) AppController.terminateSession();
              throw new Error(data.error || 'Network transmission failed');
            }
            return data;
          } catch (error) {
            ToastManager.show(error.message, 'error');
            throw error;
          }
        }
      }

      class StateManager {
        static state = {
          token: localStorage.getItem('ax_token'),
          username: localStorage.getItem('ax_user'),
          view: 'auth',
          authMode: 'authenticate',
          plugins: [],
          selectedPlugins: new Set(),
          customSources: [],
          isPublic: false,
          searchQuery: '',
          filterType: 'all',
          filterAuthor: 'all',
          authors: []
        };

        static get(key) { return this.state[key]; }
        static set(key, value) { this.state[key] = value; }
        static commitAuth(token, username) {
          localStorage.setItem('ax_token', token);
          localStorage.setItem('ax_user', username);
          this.set('token', token);
          this.set('username', username);
        }
        static clearAuth() {
          localStorage.removeItem('ax_token');
          localStorage.removeItem('ax_user');
          this.set('token', null);
          this.set('username', null);
        }
      }

      class AppController {
        static init() {
          const token = StateManager.get('token');
          if (token) this.navigate('dashboard');
          else this.navigate('auth');
        }

        static navigate(view) {
          StateManager.set('view', view);
          this.renderShell();
          if (view === 'dashboard') DashboardView.mount();
          if (view === 'settings') SettingsView.mount();
          if (view === 'auth') AuthView.mount();
        }

        static terminateSession() {
          StateManager.clearAuth();
          this.navigate('auth');
        }

        static renderShell() {
          const nav = document.getElementById('navigationNodes');
          const status = document.getElementById('statusIndicator');
          
          if (StateManager.get('token')) {
            nav.innerHTML = \`
              <button onclick="AppController.navigate('dashboard')" class="text-xs font-semibold \${StateManager.get('view')==='dashboard'?'text-white':'text-accentDim'} hover:text-white px-3 py-2 transition uppercase tracking-wider">Workspace</button>
              <button onclick="AppController.navigate('settings')" class="text-xs font-semibold \${StateManager.get('view')==='settings'?'text-white':'text-accentDim'} hover:text-white px-3 py-2 transition uppercase tracking-wider">Config</button>
              <div class="w-px h-4 bg-borderHighlight mx-2"></div>
              <button onclick="AppController.terminateSession()" class="text-xs font-mono text-accentDim hover:text-white px-3 py-2 transition uppercase">[\${StateManager.get('username')}] Logout</button>
            \`;
            status.style.display = 'flex';
            this.updateStatus('STANDBY', 'bg-accentDim');
          } else {
            nav.innerHTML = '';
            status.style.display = 'none';
          }
        }

        static updateStatus(text, colorClass) {
          document.getElementById('statusIndicator').innerHTML = \`<div class="w-1.5 h-1.5 rounded-full \${colorClass}"></div> \${text}\`;
        }

        static async syncState() {
          this.updateStatus('SYNCING...', 'bg-white animate-pulse');
          try {
            await NetworkEngine.transmit('/api/workspace/sync', 'POST', {
              selected: Array.from(StateManager.get('selectedPlugins')),
              sources: StateManager.get('customSources'),
              isPublic: StateManager.get('isPublic')
            });
            this.updateStatus('SYNCED', 'bg-green-500');
            setTimeout(() => this.updateStatus('STANDBY', 'bg-accentDim'), 2000);
          } catch (e) {
            this.updateStatus('SYNC ERROR', 'bg-red-500');
          }
        }
      }

      class AuthView {
        static mount() {
          const root = document.getElementById('applicationRoot');
          const mode = StateManager.get('authMode');
          const isLogin = mode === 'authenticate';
          
          root.innerHTML = \`
            <div class="max-w-sm mx-auto mt-16 animate-slide-up">
              <div class="mb-10">
                <h1 class="text-3xl font-semibold tracking-tight mb-2">\${isLogin ? 'Access Node' : 'Initialize Node'}</h1>
                <p class="text-sm text-accentDim">Enter core system credentials.</p>
              </div>
              <div class="glass-panel p-6 rounded-2xl space-y-4">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-mono text-accentDim uppercase tracking-widest pl-1">Identifier</label>
                  <input id="auth_user" type="text" class="w-full input-node px-4 py-3 rounded-xl text-sm font-mono" placeholder="sysadmin">
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-mono text-accentDim uppercase tracking-widest pl-1">Passkey</label>
                  <input id="auth_pass" type="password" class="w-full input-node px-4 py-3 rounded-xl text-sm font-mono" placeholder="••••••••">
                </div>
                <button id="auth_submit" class="w-full btn-core py-3 rounded-xl text-sm mt-6 flex justify-center items-center h-[46px]">
                  \${isLogin ? 'Execute Login' : 'Execute Registration'}
                </button>
              </div>
              <div class="mt-6 text-center">
                <button id="auth_toggle" class="text-xs text-accentDim hover:text-white border-b border-transparent hover:border-white pb-0.5 transition">
                  \${isLogin ? 'Create new identity constraint' : 'Return to existing identity'}
                </button>
              </div>
            </div>
          \`;

          document.getElementById('auth_submit').addEventListener('click', this.handleAuth.bind(this));
          document.getElementById('auth_toggle').addEventListener('click', () => {
            StateManager.set('authMode', isLogin ? 'register' : 'authenticate');
            this.mount();
          });
        }

        static async handleAuth() {
          const user = document.getElementById('auth_user').value;
          const pass = document.getElementById('auth_pass').value;
          const btn = document.getElementById('auth_submit');
          
          if (!user || !pass) return ToastManager.show('Missing parameters', 'error');
          
          btn.innerHTML = '<div class="spinner"></div>';
          try {
            const res = await NetworkEngine.transmit('/api/identity/authenticate', 'POST', {
              action: StateManager.get('authMode'), username: user, password: pass
            });
            StateManager.commitAuth(res.token, res.username);
            ToastManager.show('Access Granted');
            AppController.navigate('dashboard');
          } catch (e) {
            btn.innerHTML = StateManager.get('authMode') === 'authenticate' ? 'Execute Login' : 'Execute Registration';
          }
        }
      }

      class DashboardView {
        static async mount() {
          const root = document.getElementById('applicationRoot');
          this.renderLayout(root);
          
          try {
            const configData = await NetworkEngine.transmit('/api/workspace/state');
            StateManager.set('selectedPlugins', new Set(configData.configuration.selected));
            StateManager.set('customSources', configData.configuration.sources);
            StateManager.set('isPublic', configData.configuration.isPublic);
            
            const origin = window.location.origin;
            const token = StateManager.get('token');
            document.getElementById('sfw_endpoint').value = \`\${origin}/\${token}/sfw/repo.json\`;
            document.getElementById('nsfw_endpoint').value = \`\${origin}/\${token}/nsfw/repo.json\`;
            
            await this.fetchPool();
          } catch (e) {}
        }

        static renderLayout(root) {
          root.innerHTML = \`
            <div class="animate-slide-up">
              <div class="grid md:grid-cols-2 gap-4 mb-10">
                <div class="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-xs font-mono text-accentDim uppercase tracking-widest mb-1">Standard Output</h3>
                      <p class="text-sm font-semibold">SFW Architecture</p>
                    </div>
                    <button onclick="DashboardView.copyToClipboard('sfw_endpoint')" class="btn-outline px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest">Copy URI</button>
                  </div>
                  <input id="sfw_endpoint" readonly class="w-full bg-transparent text-xs font-mono text-accentDim outline-none border-t border-borderLight pt-3 truncate">
                </div>
                <div class="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-xs font-mono text-accentDim uppercase tracking-widest mb-1">Unrestricted Output</h3>
                      <p class="text-sm font-semibold">NSFW Architecture</p>
                    </div>
                    <button onclick="DashboardView.copyToClipboard('nsfw_endpoint')" class="btn-outline px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest">Copy URI</button>
                  </div>
                  <input id="nsfw_endpoint" readonly class="w-full bg-transparent text-xs font-mono text-accentDim outline-none border-t border-borderLight pt-3 truncate">
                </div>
              </div>

              <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                  <h2 class="text-xl font-semibold mb-1">Module Registry</h2>
                  <p class="text-sm text-accentDim">Inject compiled manifests into your active nodes.</p>
                </div>
                <div class="flex gap-2 w-full md:w-auto">
                  <input id="searchInput" placeholder="Query registry..." class="input-node px-4 py-2 rounded-xl text-sm w-full sm:w-64 font-mono">
                  <select id="authorFilter" class="input-node px-3 py-2 rounded-xl text-sm cursor-pointer outline-none appearance-none font-mono min-w-[140px]"></select>
                </div>
              </div>

              <div class="flex items-center justify-between mb-6">
                <div class="flex gap-1 p-1 bg-surface border border-borderLight rounded-xl">
                  <button id="f_all" class="filter-btn px-4 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest bg-white text-black transition">All Nodes</button>
                  <button id="f_sfw" class="filter-btn px-4 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-accentDim hover:text-white transition">Strict</button>
                  <button id="f_nsfw" class="filter-btn px-4 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-accentDim hover:text-white transition">Loose</button>
                </div>
                <div class="text-[10px] font-mono text-accentDim uppercase tracking-widest"><span id="injectionCount" class="text-white">0</span> Injected</div>
              </div>

              <div id="registryGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[40vh]">
                \${this.generateSkeletons(8)}
              </div>
            </div>
          \`;

          document.getElementById('searchInput').addEventListener('input', (e) => {
            StateManager.set('searchQuery', e.target.value.toLowerCase());
            this.renderGrid();
          });

          ['all', 'sfw', 'nsfw'].forEach(type => {
            document.getElementById(\`f_\${type}\`).addEventListener('click', () => {
              StateManager.set('filterType', type);
              document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-white', 'text-black');
                b.classList.add('text-accentDim');
              });
              const active = document.getElementById(\`f_\${type}\`);
              active.classList.add('bg-white', 'text-black');
              active.classList.remove('text-accentDim');
              this.renderGrid();
            });
          });
        }

        static generateSkeletons(count) {
          return Array(count).fill(0).map(() => \`<div class="glass-panel rounded-2xl p-5 h-[140px] skeleton border-0"></div>\`).join('');
        }

        static async fetchPool() {
          try {
            const data = await NetworkEngine.transmit('/api/network/discover');
            StateManager.set('plugins', data);
            
            const authors = new Set();
            data.forEach(p => authors.add(Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'Unknown')));
            const authorList = Array.from(authors).sort();
            StateManager.set('authors', authorList);
            
            const select = document.getElementById('authorFilter');
            select.innerHTML = '<option value="all">ALL DEVS</option>' + authorList.map(a => \`<option value="\${a}">\${a.substring(0,15)}</option>\`).join('');
            select.addEventListener('change', (e) => {
              StateManager.set('filterAuthor', e.target.value);
              this.renderGrid();
            });

            this.renderGrid();
          } catch (e) {
            document.getElementById('registryGrid').innerHTML = \`<div class="col-span-full p-8 text-center text-red-400 font-mono text-sm border border-red-900/30 rounded-2xl bg-red-900/10">Network Discovery Failure.</div>\`;
          }
        }

        static renderGrid() {
          const grid = document.getElementById('registryGrid');
          const plugins = StateManager.get('plugins');
          const selected = StateManager.get('selectedPlugins');
          const filters = {
            query: StateManager.get('searchQuery'),
            type: StateManager.get('filterType'),
            author: StateManager.get('filterAuthor')
          };

          let html = '';
          let count = 0;

          plugins.forEach(p => {
            const isAdult = p.tvTypes && p.tvTypes.some(t => t.toUpperCase() === 'NSFW');
            const author = Array.isArray(p.authors) ? p.authors[0] : (p.authors || 'Unknown');
            
            if (filters.type === 'sfw' && isAdult) return;
            if (filters.type === 'nsfw' && !isAdult) return;
            if (filters.author !== 'all' && author !== filters.author) return;
            if (filters.query && !p.name.toLowerCase().includes(filters.query) && !p.internalName.toLowerCase().includes(filters.query)) return;
            
            count++;
            const isSel = selected.has(p.internalName);
            const iconStr = p.iconUrl || p.icon ? \`<img src="\${p.iconUrl || p.icon}" class="w-10 h-10 rounded-lg border border-borderLight object-cover bg-black">\` : \`<div class="w-10 h-10 rounded-lg bg-black border border-borderLight flex items-center justify-center font-mono text-xs text-accentDim">N/A</div>\`;
            
            html += \`
              <div class="glass-panel rounded-2xl p-4 flex flex-col cursor-pointer transition-all \${isSel ? 'ring-1 ring-white bg-white/5' : ''}" onclick="DashboardView.toggle('\${p.internalName}')">
                <div class="flex items-start gap-3 mb-3">
                  \${iconStr}
                  <div class="flex-1 min-w-0 pt-0.5">
                    <h3 class="font-semibold text-sm truncate">\${p.name}</h3>
                    <div class="flex gap-2 mt-1.5">
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded border \${isAdult ? 'border-red-900/50 text-red-400 bg-red-900/20' : 'border-borderHighlight text-accentDim'} uppercase">\${isAdult ? 'NSFW' : 'SFW'}</span>
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded border border-borderHighlight text-accentDim uppercase">\${p.language || 'EN'}</span>
                    </div>
                  </div>
                  <div class="ml-2">
                    <label class="toggle-switch pointer-events-none">
                      <input type="checkbox" \${isSel ? 'checked' : ''}>
                      <span class="slider-round"></span>
                    </label>
                  </div>
                </div>
                <div class="mt-auto pt-3 border-t border-borderLight flex justify-between items-center text-[10px] font-mono text-accentDim">
                  <span>v\${p.version || 1}</span>
                  <span class="truncate max-w-[100px]">\${author}</span>
                </div>
              </div>
            \`;
          });

          grid.innerHTML = html || \`<div class="col-span-full py-16 text-center text-accentDim font-mono text-xs border border-borderLight border-dashed rounded-2xl">0 Objects Resolved in Query.</div>\`;
          document.getElementById('injectionCount').innerText = selected.size;
        }

        static toggle(id) {
          const set = StateManager.get('selectedPlugins');
          if (set.has(id)) set.delete(id);
          else set.add(id);
          this.renderGrid();
          AppController.syncState();
        }

        static copyToClipboard(elementId) {
          const el = document.getElementById(elementId);
          navigator.clipboard.writeText(el.value);
          ToastManager.show('URI Copied to Clipboard');
        }
      }

      class SettingsView {
        static async mount() {
          const root = document.getElementById('applicationRoot');
          
          root.innerHTML = \`
            <div class="max-w-2xl animate-slide-up">
              <h1 class="text-2xl font-semibold tracking-tight mb-8">System Configuration</h1>
              
              <div class="glass-panel p-6 rounded-2xl mb-8">
                <h2 class="text-xs font-mono text-accentDim uppercase tracking-widest mb-6 border-b border-borderLight pb-2">Access Control</h2>
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <span class="text-sm font-semibold block mb-1">Public Aggregation</span>
                    <p class="text-xs text-accentDim">Allow unauthenticated external consumption of your compiled registry.</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" id="cfg_public" \${StateManager.get('isPublic') ? 'checked' : ''}>
                    <span class="slider-round"></span>
                  </label>
                </div>
                <div class="bg-black p-3 rounded-xl border border-borderLight flex justify-between items-center">
                  <code class="text-[10px] font-mono text-accentDim truncate">\${window.location.origin}/\${StateManager.get('token')}/sfw/repo.json</code>
                </div>
              </div>

              <div class="glass-panel p-6 rounded-2xl">
                <h2 class="text-xs font-mono text-accentDim uppercase tracking-widest mb-6 border-b border-borderLight pb-2">External Data Nodes</h2>
                <div class="flex gap-2 mb-6">
                  <input id="cfg_new_source" class="input-node flex-1 rounded-xl px-4 py-2.5 text-sm font-mono" placeholder="https://raw.githubusercontent.com/.../plugins.json">
                  <button id="cfg_add_source" class="btn-core px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider">Mount</button>
                </div>
                <div id="sourcesList" class="space-y-2"></div>
              </div>
            </div>
          \`;

          document.getElementById('cfg_public').addEventListener('change', (e) => {
            StateManager.set('isPublic', e.target.checked);
            AppController.syncState();
          });

          document.getElementById('cfg_add_source').addEventListener('click', () => {
            const input = document.getElementById('cfg_new_source');
            const val = input.value.trim();
            if (val.startsWith('http')) {
              const sources = StateManager.get('customSources');
              sources.push(val);
              input.value = '';
              AppController.syncState();
              this.renderSources();
            }
          });

          this.renderSources();
        }

        static renderSources() {
          const list = document.getElementById('sourcesList');
          const sources = StateManager.get('customSources');
          
          list.innerHTML = sources.map((s, i) => \`
            <div class="flex justify-between items-center bg-black border border-borderLight p-3 rounded-xl group hover:border-borderHighlight transition">
              <span class="text-xs font-mono text-accentDim truncate mr-4">\${s}</span>
              <button onclick="SettingsView.removeSource(\${i})" class="text-[10px] font-mono uppercase tracking-widest text-red-500 opacity-50 group-hover:opacity-100 transition">Unmount</button>
            </div>
          \`).join('') || \`<p class="text-[10px] font-mono uppercase tracking-widest text-accentDim text-center py-4 border border-dashed border-borderLight rounded-xl">No external nodes mounted.</p>\`;
        }

        static removeSource(index) {
          const sources = StateManager.get('customSources');
          sources.splice(index, 1);
          AppController.syncState();
          this.renderSources();
        }
      }

      document.addEventListener("DOMContentLoaded", () => AppController.init());
    </script>
</body>
</html>`;
