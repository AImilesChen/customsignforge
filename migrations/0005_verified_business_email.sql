-- Domain mailbox verified with a received self-test and delivered external test.
UPDATE site_settings SET value_json=json_set(value_json,
 '$.email','hello@customsignforge.com'
),version=version+1 WHERE id=1;
