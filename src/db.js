export async function setupDatabase(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT, session_token TEXT UNIQUE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS settings (username TEXT PRIMARY KEY, selected TEXT DEFAULT '[]', custom_sources TEXT DEFAULT '[]')`),
    db.prepare(`CREATE TABLE IF NOT EXISTS links (link_id TEXT PRIMARY KEY, username TEXT, name TEXT, is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS analytics (link_id TEXT, visitor_hash TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`)
  ]);
}

export async function hashData(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateId(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function trackClick(db, linkId, request) {
  try {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    const date = new Date().toISOString().split('T')[0]; 
    const visitorHash = await hashData(`${ip}-${ua}-${date}`);
    await db.prepare("INSERT INTO analytics (link_id, visitor_hash) VALUES (?, ?)").bind(linkId, visitorHash).run();
  } catch(e) {}
}

export async function getUser(db, username) {
  return await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
}

export async function getUserByToken(db, token) {
  return await db.prepare("SELECT username FROM users WHERE session_token = ?").bind(token).first();
}
