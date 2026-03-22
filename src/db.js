export async function hashPassword(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateToken() {
  return crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
}

export function cleanUsername(username) {
  if (!username) return "";
  return username.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function setupDatabase(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT, token TEXT UNIQUE)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS settings (username TEXT PRIMARY KEY, selected TEXT DEFAULT '[]', sources TEXT DEFAULT '[]', is_public INTEGER DEFAULT 0)`)
  ]);
}

export async function registerUser(db, username, password) {
  const hash = await hashPassword(password);
  const token = generateToken();
  await db.batch([
    db.prepare("INSERT INTO users (username, password, token) VALUES (?, ?, ?)").bind(username, hash, token),
    db.prepare("INSERT INTO settings (username) VALUES (?)").bind(username)
  ]);
  return token;
}

export async function loginUser(db, username, password) {
  const hash = await hashPassword(password);
  const user = await db.prepare("SELECT token FROM users WHERE username = ? AND password = ?").bind(username, hash).first();
  return user ? user.token : null;
}

export async function getUserByToken(db, token) {
  if (!token) return null;
  return await db.prepare("SELECT username, token FROM users WHERE token = ?").bind(token).first();
}

export async function getUserSettings(db, username) {
  return await db.prepare("SELECT selected, sources, is_public FROM settings WHERE username = ?").bind(username).first();
}

export async function updateUserSettings(db, username, selected, sources, isPublic) {
  await db.prepare("UPDATE settings SET selected = ?, sources = ?, is_public = ? WHERE username = ?")
    .bind(JSON.stringify(selected), JSON.stringify(sources), isPublic ? 1 : 0, username).run();
}
