-- Public contact and company details supplied/approved by the operator.
-- Email stays unset until its actual sending/receiving setup is verified.
UPDATE site_settings SET value_json=json_set(value_json,
 '$.whatsapp','8615990661727',
 '$.operatorName','Taizhou Xunfeng Trading Co., Ltd.',
 '$.operatorNameLocal','台州巽风贸易有限公司',
 '$.businessDescription','Custom business signs, illuminated letters and dimensional lettering, supplied through manufacturing partners. We welcome project enquiries for Southeast Asia, Europe and North America. Specifications, price and delivery arrangements are confirmed individually.'
),version=version+1 WHERE id=1;
