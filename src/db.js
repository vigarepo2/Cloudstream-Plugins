export async function setupDatabase(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS accounts (username TEXT PRIMARY KEY, password TEXT, session_token TEXT UNIQUE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS user_configs (username TEXT PRIMARY KEY, selected TEXT DEFAULT '[]', custom_sources TEXT DEFAULT '[]')`)
  ]);
}

export async function hashData(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateId(length = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function getUser(db, username) {
  return await db.prepare("SELECT * FROM accounts WHERE username = ?").bind(username).first();
}

export async function getUserByToken(db, token) {
  return await db.prepare("SELECT username FROM accounts WHERE session_token = ?").bind(token).first();
}
