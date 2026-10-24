-- Correct former sign-in instructions without replacing edited content.
UPDATE content_items
SET draft_json = CASE
  WHEN instr(coalesce(json_extract(draft_json,'$.body'),''),'Sign in to share your artwork, approximate dimensions, quantity, delivery destination and target date.') > 0
    THEN json_set(draft_json,'$.body',replace(json_extract(draft_json,'$.body'),'Sign in to share your artwork, approximate dimensions, quantity, delivery destination and target date.','Share your artwork, approximate dimensions, quantity, delivery destination and target date without signing in.'))
  WHEN instr(coalesce(json_extract(draft_json,'$.body'),''),'Sign in to send your project details and files, then discuss the specification and quote with us.') > 0
    THEN json_set(draft_json,'$.body',replace(json_extract(draft_json,'$.body'),'Sign in to send your project details and files, then discuss the specification and quote with us.','Send your full project details and optional files without creating an account, then discuss the specification and quote with us.'))
  ELSE draft_json END,
published_json = CASE
  WHEN instr(coalesce(json_extract(published_json,'$.body'),''),'Sign in to share your artwork, approximate dimensions, quantity, delivery destination and target date.') > 0
    THEN json_set(published_json,'$.body',replace(json_extract(published_json,'$.body'),'Sign in to share your artwork, approximate dimensions, quantity, delivery destination and target date.','Share your artwork, approximate dimensions, quantity, delivery destination and target date without signing in.'))
  WHEN instr(coalesce(json_extract(published_json,'$.body'),''),'Sign in to send your project details and files, then discuss the specification and quote with us.') > 0
    THEN json_set(published_json,'$.body',replace(json_extract(published_json,'$.body'),'Sign in to send your project details and files, then discuss the specification and quote with us.','Send your full project details and optional files without creating an account, then discuss the specification and quote with us.'))
  ELSE published_json END,
version=version+1
WHERE type='page' AND slug IN ('about','for-sign-companies') AND (
 instr(coalesce(json_extract(draft_json,'$.body'),''),'Sign in to share your artwork, approximate dimensions, quantity, delivery destination and target date.') > 0 OR
 instr(coalesce(json_extract(draft_json,'$.body'),''),'Sign in to send your project details and files, then discuss the specification and quote with us.') > 0 OR
 instr(coalesce(json_extract(published_json,'$.body'),''),'Sign in to share your artwork, approximate dimensions, quantity, delivery destination and target date.') > 0 OR
 instr(coalesce(json_extract(published_json,'$.body'),''),'Sign in to send your project details and files, then discuss the specification and quote with us.') > 0
);
