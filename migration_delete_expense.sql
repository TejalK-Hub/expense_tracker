ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS deleted_on TIMESTAMP;

ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS deleted_by INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'expenses_deleted_by_fk'
    ) THEN
        ALTER TABLE expenses
        ADD CONSTRAINT expenses_deleted_by_fk
        FOREIGN KEY (deleted_by) REFERENCES users(id);
    END IF;
END $$;