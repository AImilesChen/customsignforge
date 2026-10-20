ALTER TABLE enquiries ADD COLUMN labels_json TEXT CHECK(labels_json IS NULL OR json_valid(labels_json));
