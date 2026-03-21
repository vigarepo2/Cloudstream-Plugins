const DEFAULT_SOURCES = [
  "https://raw.githubusercontent.com/SaurabhKaperwan/CSX/builds/plugins.json",
  "https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/refs/heads/builds/plugins.json",
  "https://raw.githubusercontent.com/NivinCNC/CNCVerse-Cloud-Stream-Extension/builds/plugins.json",
  "https://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds/plugins.json",
  "https://raw.githubusercontent.com/rockhero1234/cinephile/builds/plugins.json",
  "https://raw.githubusercontent.com/Sushan64/NetMirror-Extension/builds/plugins.json",
  "https://cloudstream.lasyhost.tech/plugins.json",
  "https://raw.githubusercontent.com/crafteraadarsh/vibemax/builds/plugins.json"
];

async function fetchPluginSource(url, depth = 0) {
  if (depth > 2) return []; 
  try {
    const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data.plugins && Array.isArray(data.plugins)) return data.plugins;
    if (data.pluginLists && Array.isArray(data.pluginLists)) {
      const subPromises = data.pluginLists.map(subUrl => fetchPluginSource(subUrl, depth + 1));
      const subResults = await Promise.all(subPromises);
      return subResults.flat();
    }
    return [];
  } catch (err) { return []; }
}

export async function getAggregatedPlugins(customUrls = []) {
  const allUrls = [...DEFAULT_SOURCES, ...customUrls];
  const promises = allUrls.map(url => fetchPluginSource(url));
  const results = await Promise.all(promises);
  const rawPlugins = results.flat();
  
  const processedPlugins = [];
  const nameCount = new Map();

  for (const p of rawPlugins) {
    if (!p || typeof p !== 'object' || !p.name || p.status === 0) continue;
    let baseKey = p.internalName || p.name.replace(/\s+/g, '');
    
    if (nameCount.has(baseKey)) {
      const count = nameCount.get(baseKey) + 1;
      nameCount.set(baseKey, count);
      p.internalName = `${baseKey}_${count}`;
      p.name = `${p.name} ${count}`;
    } else {
      nameCount.set(baseKey, 1);
      p.internalName = baseKey;
    }

    if (typeof p.type === 'string' && !p.tvTypes) p.tvTypes = p.type.split(',').map(s => s.trim());
    else if (!p.tvTypes) p.tvTypes = [];

    processedPlugins.push(p);
  }
  return processedPlugins.sort((a, b) => a.name.localeCompare(b.name));
}
