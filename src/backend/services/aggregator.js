export class AggregatorService {
  static DEFAULT_NODES = [
    "https://raw.githubusercontent.com/SaurabhKaperwan/CSX/builds/plugins.json",
    "https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/refs/heads/builds/plugins.json",
    "https://raw.githubusercontent.com/NivinCNC/CNCVerse-Cloud-Stream-Extension/builds/plugins.json",
    "https://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds/plugins.json",
    "https://raw.githubusercontent.com/rockhero1234/cinephile/builds/plugins.json",
    "https://raw.githubusercontent.com/Sushan64/NetMirror-Extension/builds/plugins.json",
    "https://cloudstream.lasyhost.tech/plugins.json",
    "https://raw.githubusercontent.com/crafteraadarsh/vibemax/builds/plugins.json"
  ];

  static async fetchNodeData(url, currentDepth = 0) {
    if (currentDepth > 3) return [];
    
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 6000);

    try {
      const response = await fetch(url, {
        cf: { cacheTtl: 600, cacheEverything: true },
        signal: abortController.signal,
        headers: { "User-Agent": "Aether-Registry-Engine/2.0" }
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) return [];
      
      const payload = await response.json();
      
      if (Array.isArray(payload)) return payload;
      if (payload.plugins && Array.isArray(payload.plugins)) return payload.plugins;
      if (payload.pluginLists && Array.isArray(payload.pluginLists)) {
        const nestedPromises = payload.pluginLists.map(nestedUrl => this.fetchNodeData(nestedUrl, currentDepth + 1));
        const nestedResults = await Promise.all(nestedPromises);
        return nestedResults.flat();
      }
      
      return [];
    } catch (error) {
      clearTimeout(timeout);
      return [];
    }
  }

  static processManifests(rawManifests) {
    const sanitizedManifests = [];
    const collisionMap = new Map();

    for (const manifest of rawManifests) {
      if (!manifest || typeof manifest !== 'object' || !manifest.name || manifest.status === 0) continue;
      
      let baseIdentifier = manifest.internalName || manifest.name.replace(/\s+/g, '');
      
      if (collisionMap.has(baseIdentifier)) {
        const instanceCount = collisionMap.get(baseIdentifier) + 1;
        collisionMap.set(baseIdentifier, instanceCount);
        manifest.internalName = `${baseIdentifier}_${instanceCount}`;
        manifest.name = `${manifest.name} (Alt ${instanceCount})`;
      } else {
        collisionMap.set(baseIdentifier, 1);
        manifest.internalName = baseIdentifier;
      }

      if (typeof manifest.type === 'string' && !manifest.tvTypes) {
        manifest.tvTypes = manifest.type.split(',').map(str => str.trim().toUpperCase());
      } else if (!manifest.tvTypes) {
        manifest.tvTypes = ["VOD"];
      }

      sanitizedManifests.push(manifest);
    }

    return sanitizedManifests.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async compileNetwork(customUrls = []) {
    const targetUrls = [...this.DEFAULT_NODES, ...customUrls];
    const networkPromises = targetUrls.map(url => this.fetchNodeData(url));
    const rawResults = await Promise.all(networkPromises);
    const unifiedPool = rawResults.flat();
    return this.processManifests(unifiedPool);
  }
}
