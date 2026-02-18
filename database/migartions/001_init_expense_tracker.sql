-- =====================================
-- EXPENSE TRACKER - INITIAL MIGRATION
-- Run once on new database
-- =====================================

-- create DB first : 
CREATE DATABASE expense_tracker;

--then paste in powershell 
psql -U postgres -d expense_tracker -f 001_init_expense_tracker.sql

--OR 
-- paste & execute in query tool of PGAdmin 


-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20)
);


-- =========================
-- MASTER TABLES
-- =========================

CREATE TABLE expense_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    is_published BOOLEAN DEFAULT TRUE,
    deleted_on TIMESTAMP,
    deleted_by INT
);

CREATE TABLE visit_reason (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    is_published BOOLEAN DEFAULT TRUE,
    deleted_on TIMESTAMP,
    deleted_by INT
);

CREATE TABLE expense_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE rejection_reason (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);


-- =========================
-- VISITS
-- =========================
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    visit_reason_id INT REFERENCES visit_reason(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date >= start_date)
);


-- =========================
-- EXPENSES
-- =========================
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    visit_id INT REFERENCES visits(id),
    user_id INT REFERENCES users(id),
    date DATE NOT NULL,
    category_id INT REFERENCES expense_category(id),
    amount DECIMAL(10,2) CHECK (amount > 0),
    description TEXT,
    bill_path TEXT NOT NULL,
    receipt_id VARCHAR(100) NOT NULL,
    status_id INT REFERENCES expense_status(id),
    approved_by INT REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_receipt_id UNIQUE (receipt_id)
);


-- =========================
-- EXPENSE STATUS HISTORY
-- =========================
CREATE TABLE expense_status_history (
    id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    status_id INT REFERENCES expense_status(id),
    rejection_reason_id INT REFERENCES rejection_reason(id),
    changed_by INT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- ADVANCES
-- =========================
CREATE TABLE advances (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    year INT,
    month INT,
    amount DECIMAL(10,2) DEFAULT 0,
    given_date DATE,
    UNIQUE(user_id, year, month)
);



-- =========================
-- DEFAULT MASTER DATA
-- =========================

INSERT INTO expense_category (name) VALUES
('Travel'),
('Food'),
('Petrol'),
('Material'),
('Other');

INSERT INTO expense_status (name) VALUES
('Pending'),
('Submitted'),
('Approved'),
('Rejected');

INSERT INTO rejection_reason (name) VALUES
('Bill not clear'),
('Amount mismatch'),
('Policy violation'),
('Duplicate entry');

INSERT INTO visit_reason (name) VALUES
('Client Site Installation'),
('Device Maintenance / Service'),
('Network / Gateway Setup'),
('IoT Device Deployment'),
('Troubleshooting / Issue Resolution'),
('Site Survey'),
('Client Meeting / Technical Discussion'),
('Training / Demonstration'),
('Internal Field Testing'),
('Emergency Breakdown Support'),
('Other / Internal Office Work');


-- =========================
-- DEFAULT USERS (OPTIONAL) dummy data 
-- =========================
INSERT INTO users (name, email, password, role) VALUES
('Admin1', 'admin1@test.com', '123', 'Admin'),
('Employee1', 'emp1@test.com', '456', 'Employee');

-- =========================
-- MONTHLY BALANCE VIEW
-- =========================
CREATE VIEW monthly_balance_view AS
SELECT
    e.user_id,
    EXTRACT(YEAR FROM e.date) AS year,
    EXTRACT(MONTH FROM e.date) AS month,

    SUM(
        CASE
            WHEN es.name = 'Approved'
            THEN e.amount
            ELSE 0
        END
    ) AS total_expense,

    a.amount AS advance,

    SUM(
        CASE
            WHEN es.name = 'Approved'
            THEN e.amount
            ELSE 0
        END
    ) - a.amount AS balance

FROM expenses e

JOIN expense_status es
    ON es.id = e.status_id

LEFT JOIN advances a
    ON a.user_id = e.user_id
    AND a.year = EXTRACT(YEAR FROM e.date)
    AND a.month = EXTRACT(MONTH FROM e.date)

GROUP BY
    e.user_id,
    EXTRACT(YEAR FROM e.date),
    EXTRACT(MONTH FROM e.date),
    a.amount;
