export async function getCache(kv, key) {
  const data = await kv.get(key);
  return data ? data : null;
}

export async function setCache(kv, key, value, ttlSeconds = 300) {
  await kv.put(key, value, { expirationTtl: ttlSeconds });
}

export async function clearLinkCache(kv, linkId) {
  await kv.delete(`repo_${linkId}_sfw`);
  await kv.delete(`repo_${linkId}_nsfw`);
}
