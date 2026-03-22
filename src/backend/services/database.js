export class DatabaseService {
  constructor(db) {
    this.db = db;
  }

  async initializeSchema() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS accounts (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        access_token TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS configurations (
        username TEXT PRIMARY KEY,
        selected_plugins TEXT DEFAULT '[]',
        custom_sources TEXT DEFAULT '[]',
        is_public INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(username) REFERENCES accounts(username)
      )`
    ];

    await this.db.batch(queries.map(q => this.db.prepare(q)));
  }

  async createAccount(username, passwordHash, token) {
    const queries = [
      this.db.prepare("INSERT INTO accounts (username, password_hash, access_token) VALUES (?, ?, ?)").bind(username, passwordHash, token),
      this.db.prepare("INSERT INTO configurations (username, selected_plugins, custom_sources) VALUES (?, '[]', '[]')").bind(username)
    ];
    await this.db.batch(queries);
  }

  async getAccountByUsername(username) {
    return await this.db.prepare("SELECT * FROM accounts WHERE username = ?").bind(username).first();
  }

  async getAccountByToken(token) {
    return await this.db.prepare("SELECT username, access_token FROM accounts WHERE access_token = ?").bind(token).first();
  }

  async getConfiguration(username) {
    return await this.db.prepare("SELECT selected_plugins, custom_sources, is_public FROM configurations WHERE username = ?").bind(username).first();
  }

  async updateConfiguration(username, selected, sources, isPublic) {
    return await this.db.prepare("UPDATE configurations SET selected_plugins = ?, custom_sources = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?")
      .bind(JSON.stringify(selected), JSON.stringify(sources), isPublic ? 1 : 0, username).run();
  }
}
