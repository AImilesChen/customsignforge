CREATE TABLE enquiry_files (
 id TEXT PRIMARY KEY,
 customer_id TEXT NOT NULL REFERENCES customers(id),
 enquiry_id TEXT REFERENCES enquiries(id),
 object_key TEXT NOT NULL UNIQUE,
 filename TEXT NOT NULL,
 size INTEGER NOT NULL CHECK(size > 0 AND size <= 10485760),
 state TEXT NOT NULL DEFAULT 'uploading' CHECK(state IN ('uploading','ready','deleting')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 expires_at INTEGER,
 CHECK(enquiry_id IS NULL OR expires_at IS NULL)
);
CREATE INDEX enquiry_files_customer ON enquiry_files(customer_id,enquiry_id);
CREATE INDEX enquiry_files_enquiry ON enquiry_files(enquiry_id);
CREATE INDEX enquiry_files_expiry ON enquiry_files(expires_at);
