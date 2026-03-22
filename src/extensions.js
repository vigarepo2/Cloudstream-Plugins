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

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return 'Unknown';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

export async function getBundledExtensions() {
  const promises = DEFAULT_SOURCES.map(url => fetchSource(url));
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
    
    let typesArray = [];
    if (Array.isArray(item.tvTypes)) {
      typesArray = item.tvTypes.map(t => t.trim());
    } else if (typeof item.tvTypes === 'string') {
      typesArray = item.tvTypes.split(',').map(t => t.trim());
    } else if (typeof item.type === 'string') {
      typesArray = item.type.split(',').map(t => t.trim());
    }
    
    item.tvTypes = typesArray.length > 0 ? typesArray : ["VOD"];
    item.isAdult = item.tvTypes.some(t => t.toUpperCase() === "NSFW");
    item.formattedSize = formatBytes(item.fileSize);
    
    processed.push(item);
  }
  return processed;
}
