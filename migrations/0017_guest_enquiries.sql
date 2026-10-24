ALTER TABLE enquiries ADD COLUMN guest_id TEXT;
ALTER TABLE enquiries ADD COLUMN claim_hash TEXT;
CREATE INDEX enquiries_guest ON enquiries(guest_id,created_at DESC);

CREATE TABLE enquiry_files_new (
 id TEXT PRIMARY KEY,
 customer_id TEXT REFERENCES customers(id),
 guest_id TEXT,
 enquiry_id TEXT REFERENCES enquiries(id),
 object_key TEXT NOT NULL UNIQUE,
 filename TEXT NOT NULL,
 size INTEGER NOT NULL CHECK(size > 0 AND size <= 10485760),
 state TEXT NOT NULL DEFAULT 'uploading' CHECK(state IN ('uploading','ready','deleting')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 expires_at INTEGER,
 CHECK((customer_id IS NULL) <> (guest_id IS NULL)),
 CHECK(enquiry_id IS NULL OR expires_at IS NULL)
);
INSERT INTO enquiry_files_new(id,customer_id,enquiry_id,object_key,filename,size,state,created_at,expires_at)
 SELECT id,customer_id,enquiry_id,object_key,filename,size,state,created_at,expires_at FROM enquiry_files;
DROP TABLE enquiry_files;
ALTER TABLE enquiry_files_new RENAME TO enquiry_files;
CREATE INDEX enquiry_files_customer ON enquiry_files(customer_id,enquiry_id);
CREATE INDEX enquiry_files_guest ON enquiry_files(guest_id,enquiry_id);
CREATE INDEX enquiry_files_enquiry ON enquiry_files(enquiry_id);
CREATE INDEX enquiry_files_expiry ON enquiry_files(expires_at);
