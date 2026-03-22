const DEFAULT_SOURCES = [
  "https://raw.githubusercontent.com/SaurabhKaperwan/CSX/builds/plugins.json",
  "https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/refs/heads/builds/plugins.json",
  "https://raw.githubusercontent.com/NivinCNC/CNCVerse-Cloud-Stream-Extension/builds/plugins.json",
  "https://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds/plugins.json",
  "https://raw.githubusercontent.com/rockhero1234/cinephile/builds/plugins.json",
  "https://raw.githubusercontent.com/Sushan64/NetMirror-Extension/builds/plugins.json",
  "https://cloudstream.lasyhost.tech/plugins.json",
  "https://raw.githubusercontent.com/crafteraadarsh/vibemax/builds/plugins.json",
  "https://raw.githubusercontent.com/HatsuneMikuUwU/cloudstream-extensions-uwu/builds/plugins.json",
  "https://raw.githubusercontent.com/Kraptor123/Cs-Karma/refs/heads/builds/plugins.json",
  "https://raw.githubusercontent.com/phisher98/CXXX/builds/plugins.json",
  "https://raw.githubusercontent.com/Kraptor123/Cs-GizliKeyif/refs/heads/builds/plugins.json"
];

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) return 'N/A';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function fetchSource(url, depth = 0) {
  if (depth > 2) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 
  try {
    const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true }, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let coll = [];
    if (Array.isArray(data)) coll = data;
    else {
      if (data.plugins && Array.isArray(data.plugins)) coll = coll.concat(data.plugins);
      if (data.pluginLists && Array.isArray(data.pluginLists)) {
        const sub = await Promise.allSettled(data.pluginLists.map(u => fetchSource(u, depth + 1)));
        sub.forEach(result => { if(result.status === 'fulfilled') coll = coll.concat(result.value); });
      }
    }
    return coll;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[Fetch Failed] ${url}:`, err.message);
    return []; // Return empty array to prevent crashing the whole list
  }
}

export async function getBundledExtensions(customUrls = []) {
  const allUrls = [...new Set([...DEFAULT_SOURCES, ...(customUrls || [])])];
  
  // Using allSettled so one broken repo doesn't ruin the whole fetch
  const results = await Promise.allSettled(allUrls.map(url => fetchSource(url)));
  const rawList = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .flat();
  
  const processed = [];
  const namesMap = new Map();

  for (const item of rawList) {
    if (!item || typeof item !== 'object' || !item.name) continue;
    
    let baseName = item.name;
    if (namesMap.has(baseName)) {
      const count = namesMap.get(baseName) + 1;
      namesMap.set(baseName, count);
      item.name = `${baseName} (${count})`;
      item.internalName = `${item.internalName || baseName.replace(/\s+/g, '')}_${count}`;
    } else {
      namesMap.set(baseName, 1);
      item.internalName = item.internalName || baseName.replace(/\s+/g, '');
    }
    
    let typesArray = [];
    try {
        if (Array.isArray(item.tvTypes)) typesArray = item.tvTypes.map(t => typeof t === 'string' ? t.trim() : '');
        else if (typeof item.tvTypes === 'string') typesArray = item.tvTypes.split(',').map(t => t.trim());
        else if (typeof item.type === 'string') typesArray = item.type.split(',').map(t => t.trim());
    } catch(e) { console.error("Error parsing types for", item.name); }
    
    item.tvTypes = typesArray.filter(t => t.length > 0);
    if(item.tvTypes.length === 0) item.tvTypes = ["VOD"];
    
    item.isAdult = item.tvTypes.some(t => t.toUpperCase() === "NSFW");
    item.formattedSize = formatBytes(item.fileSize);
    item.isBroken = item.status === 0;
    
    processed.push(item);
  }
  return processed.sort((a, b) => a.name.localeCompare(b.name));
}
