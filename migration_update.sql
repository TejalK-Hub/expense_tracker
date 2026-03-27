-- =====================================
-- EXPENSE TRACKER - V2 PATCH
-- 
-- (step 1: migration.sql , step 2: migration_update.sql)
-- if step 1 already done, only perform step 2)
-- step 2: how to run ? 
-- psql -U postgres -d expense_tracker -f migration_update.sql
-- =====================================

SET client_min_messages TO WARNING;


-- 1. VISITS TABLE UPDATES


ALTER TABLE visits
ADD COLUMN IF NOT EXISTS agenda TEXT;

ALTER TABLE visits
ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2) DEFAULT 0;

ALTER TABLE visits
ADD COLUMN IF NOT EXISTS visit_name TEXT;


-- 2. EXPENSES TABLE UPDATES


ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS rejection_description VARCHAR(100);


-- 3. INDEX / PERFORMANCE


CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_visit_id ON expenses(visit_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status_id ON expenses(status_id);


-- 4. VISIT TOTAL TRIGGER (IF NOT EXISTS)


CREATE OR REPLACE FUNCTION update_visit_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE visits
    SET amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE visit_id = NEW.visit_id
    )
    WHERE id = NEW.visit_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS

DROP TRIGGER IF EXISTS expense_insert_trigger ON expenses;
CREATE TRIGGER expense_insert_trigger
AFTER INSERT ON expenses
FOR EACH ROW EXECUTE FUNCTION update_visit_total();

DROP TRIGGER IF EXISTS expense_update_trigger ON expenses;
CREATE TRIGGER expense_update_trigger
AFTER UPDATE OF amount ON expenses
FOR EACH ROW EXECUTE FUNCTION update_visit_total();

DROP TRIGGER IF EXISTS expense_delete_trigger ON expenses;
CREATE TRIGGER expense_delete_trigger
AFTER DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_visit_total();


-- 5. DATA CONSISTENCY FIX


UPDATE visits
SET visit_name = CONCAT(
    (SELECT name FROM clients WHERE id = visits.client_id),
    '_',
    start_date,
    '_',
    (SELECT name FROM visit_reason WHERE id = visits.visit_reason_id)
)
WHERE visit_name IS NULL;

-- =========================
-- END
-- =========================

