PRAGMA foreign_keys = ON;
CREATE TABLE content_items (
 id TEXT PRIMARY KEY, type TEXT NOT NULL CHECK(type IN ('product','project','landing','page')),
 slug TEXT NOT NULL, draft_json TEXT NOT NULL CHECK(json_valid(draft_json)), published_json TEXT CHECK(published_json IS NULL OR json_valid(published_json)),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')), sort_order INTEGER NOT NULL DEFAULT 0,
 version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(type,slug)
);
CREATE INDEX content_published ON content_items(type,status,sort_order);
CREATE TABLE site_settings (id INTEGER PRIMARY KEY CHECK(id=1),value_json TEXT NOT NULL CHECK(json_valid(value_json)),version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE enquiries (
 id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE,payload_hash TEXT NOT NULL,
 details_json TEXT NOT NULL CHECK(json_valid(details_json)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 record_status TEXT NOT NULL DEFAULT 'web_recorded' CHECK(record_status IN ('web_recorded','chat_confirmed','duplicate_or_spam')),
 business_stage TEXT NOT NULL DEFAULT 'needs_details',quality TEXT NOT NULL DEFAULT 'unreviewed',
 confirmed_at TEXT,amount_minor INTEGER,currency TEXT,closed_at TEXT,reason TEXT NOT NULL DEFAULT '',
 version INTEGER NOT NULL DEFAULT 1,last_write TEXT NOT NULL DEFAULT ''
);
CREATE INDEX enquiries_created ON enquiries(created_at DESC);
CREATE TABLE followup_logs (id TEXT PRIMARY KEY,enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,actor TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,change_json TEXT NOT NULL CHECK(json_valid(change_json)),note TEXT NOT NULL DEFAULT '');
CREATE TABLE media (key TEXT PRIMARY KEY,mime TEXT NOT NULL,size INTEGER NOT NULL,alt TEXT NOT NULL,source_note TEXT NOT NULL,published INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY,bucket INTEGER NOT NULL,count INTEGER NOT NULL);
