CREATE TABLE measurement_events (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL CHECK(name IN ('page_view','quote_form_open','quote_form_submit_success','whatsapp_click','direct_chat')),
 page TEXT NOT NULL,
 context_json TEXT NOT NULL CHECK(json_valid(context_json)),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX measurement_created ON measurement_events(created_at,name);
