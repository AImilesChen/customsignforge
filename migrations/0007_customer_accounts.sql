CREATE TABLE customers (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 google_sub TEXT UNIQUE,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 last_login_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE customer_sessions (
 id TEXT PRIMARY KEY,
 customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL
);
CREATE INDEX customer_sessions_expiry ON customer_sessions(expires_at);
CREATE TABLE customer_email_challenges (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL,
 code_hash TEXT NOT NULL,
 browser_hash TEXT NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0,
 expires_at INTEGER NOT NULL
);
CREATE INDEX customer_challenges_expiry ON customer_email_challenges(expires_at);
ALTER TABLE enquiries ADD COLUMN customer_id TEXT REFERENCES customers(id);
CREATE INDEX enquiries_customer ON enquiries(customer_id,created_at DESC);
