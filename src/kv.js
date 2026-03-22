export async function getCache(kv, key) {
  return await kv.get(key);
}

export async function setCache(kv, key, value, ttlSeconds = 604800) {
  await kv.put(key, value, { expirationTtl: ttlSeconds });
}

export async function clearUserCaches(kv, username) {
  await kv.delete(`repo_${username}_all`);
  await kv.delete(`repo_${username}_sfw`);
  await kv.delete(`repo_${username}_nsfw`);
  await kv.delete(`user_plugins_${username}`);
}
