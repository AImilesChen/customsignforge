ALTER TABLE enquiries ADD COLUMN archived_at TEXT;
CREATE INDEX enquiries_archive_created ON enquiries(archived_at,created_at,id);
