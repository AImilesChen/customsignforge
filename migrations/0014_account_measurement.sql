-- Historic events have no verified account identity and cannot be backfilled.
ALTER TABLE measurement_events ADD COLUMN account_key TEXT;
CREATE INDEX measurement_account_name_date ON measurement_events(account_key,name,created_at);
