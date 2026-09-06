-- Voice messages recorded in the browser are WebM/Opus (Chrome, Firefox) or MP4/AAC (Safari).
-- MP4 was already allowed; add WebM audio to the gifts bucket.
update storage.buckets
set allowed_mime_types = array_append(allowed_mime_types, 'audio/webm')
where id = 'gifts' and not ('audio/webm' = any(allowed_mime_types));
