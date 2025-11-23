-- Custom SQL migration file, put your code below! --
UPDATE notes
SET updated_by = created_by
WHERE updated_by IS NULL;