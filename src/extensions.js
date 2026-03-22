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
  if (!bytes || isNaN(bytes) || bytes === 0) return 'N/A';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    let collectedPlugins = [];

    // Scenario 1: The JSON is a direct array (Like the Bollyflix example you provided)
    if (Array.isArray(data)) {
        collectedPlugins = data;
    } else {
        // Scenario 2: The JSON has nested 'plugins' and/or 'pluginLists'
        if (data.plugins && Array.isArray(data.plugins)) {
            collectedPlugins = collectedPlugins.concat(data.plugins);
        }
        if (data.pluginLists && Array.isArray(data.pluginLists)) {
            const subPromises = data.pluginLists.map(subUrl => fetchSource(subUrl, depth + 1));
            const subResults = await Promise.all(subPromises);
            collectedPlugins = collectedPlugins.concat(subResults.flat());
        }
    }
    return collectedPlugins;
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
    // Skip broken or empty objects
    if (!item || typeof item !== 'object' || !item.name || item.status === 0) continue;
    
    // Resolve Naming Collisions (if two plugins share the exact same name)
    let key = item.internalName || item.name.replace(/\s+/g, '');
    if (names.has(key)) {
      const count = names.get(key) + 1;
      names.set(key, count);
      item.internalName = `${key}_${count}`;
    } else {
      names.set(key, 1);
      item.internalName = key;
    }
    
    // Safely Parse TV Types without crashing
    let typesArray = [];
    try {
        if (Array.isArray(item.tvTypes)) {
            typesArray = item.tvTypes.map(t => typeof t === 'string' ? t.trim() : '');
        } else if (typeof item.tvTypes === 'string') {
            typesArray = item.tvTypes.split(',').map(t => t.trim());
        } else if (typeof item.type === 'string') {
            typesArray = item.type.split(',').map(t => t.trim());
        }
    } catch(e) {}
    
    item.tvTypes = typesArray.filter(t => t.length > 0);
    if(item.tvTypes.length === 0) item.tvTypes = ["VOD"]; // Fallback
    
    item.isAdult = item.tvTypes.some(t => t.toUpperCase() === "NSFW");
    item.formattedSize = formatBytes(item.fileSize);
    
    processed.push(item);
  }
  
  return processed.sort((a, b) => a.name.localeCompare(b.name));
}
