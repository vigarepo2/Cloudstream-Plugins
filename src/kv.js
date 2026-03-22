export async function getCache(kv, key) {
  return await kv.get(key);
}

export async function setCache(kv, key, value, ttlSeconds = 300) {
  await kv.put(key, value, { expirationTtl: ttlSeconds });
}

export async function clearUserCaches(db, kv, username) {
  // Clear the user's personal link cache
  await kv.delete(`repo_${username}_sfw`);
  await kv.delete(`repo_${username}_nsfw`);
  
  // Clear all reseller links associated with this user
  try {
    const { results } = await db.prepare("SELECT link_id FROM links WHERE username = ?").bind(username).all();
    for (const row of results) {
      await kv.delete(`repo_${row.link_id}_sfw`);
      await kv.delete(`repo_${row.link_id}_nsfw`);
    }
  } catch(e) {}
}
