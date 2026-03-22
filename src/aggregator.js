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

async function fetchSource(url, depth = 0) {
  if (depth > 2) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true }, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data.plugins) return data.plugins;
    if (data.pluginLists) {
      const sub = await Promise.all(data.pluginLists.map(u => fetchSource(u, depth + 1)));
      return sub.flat();
    }
    return [];
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }
}

export async function getBundledExtensions(customUrls = []) {
  const allUrls = [...DEFAULT_SOURCES, ...(customUrls || [])];
  const promises = allUrls.map(url => fetchSource(url));
  const results = await Promise.all(promises);
  const rawList = results.flat();
  
  const processed = [];
  const names = new Map();

  for (const item of rawList) {
    if (!item || typeof item !== 'object' || !item.name || item.status === 0) continue;
    let key = item.internalName || item.name.replace(/\s+/g, '');
    if (names.has(key)) {
      const count = names.get(key) + 1;
      names.set(key, count);
      item.internalName = `${key}_${count}`;
    } else {
      names.set(key, 1);
      item.internalName = key;
    }
    
    const isAdult = Array.isArray(item.tvTypes) && item.tvTypes.some(t => t.toUpperCase() === "NSFW");
    item.isAdult = isAdult; 
    processed.push(item);
  }
  return processed;
}
