CREATE TABLE admin_sessions (id TEXT PRIMARY KEY,subject TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE TABLE oauth_states (state_hash TEXT PRIMARY KEY,expires_at INTEGER NOT NULL);
CREATE TABLE email_challenges (id TEXT PRIMARY KEY,email TEXT NOT NULL,code_hash TEXT NOT NULL,browser_hash TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,expires_at INTEGER NOT NULL);
