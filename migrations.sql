--
-- PostgreSQL database dump
--

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

-- =====================================
-- EXPENSE TRACKER - V1 MIGRATION
-- Run once on new database
-- =====================================

-- Step 1: Create database manually
-- CREATE DATABASE expense_tracker;

-- Step 2: Run migration
-- psql -U postgres -d expense_tracker -f 001_v1.sql

SET client_min_messages TO WARNING;

-- Clean install (cross check once)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
--
-- Name: advances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advances (
    id integer NOT NULL,
    user_id integer,
    year integer,
    month integer,
    amount numeric(10,2) DEFAULT 0 NOT NULL,
    given_date date
);


--
-- Name: advances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.advances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: advances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.advances_id_seq OWNED BY public.advances.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    created_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    is_published boolean DEFAULT true,
    deleted_on timestamp without time zone,
    deleted_by integer
);


--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: expense_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_category (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    is_published boolean DEFAULT true,
    deleted_on timestamp without time zone,
    deleted_by integer
);


--
-- Name: expense_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_category_id_seq OWNED BY public.expense_category.id;


--
-- Name: expense_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_status (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    deleted_on timestamp without time zone,
    deleted_by integer
);


--
-- Name: expense_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_status_history (
    id integer NOT NULL,
    expense_id integer NOT NULL,
    status_id integer NOT NULL,
    rejection_reason_id integer,
    changed_by integer,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: expense_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_status_history_id_seq OWNED BY public.expense_status_history.id;


--
-- Name: expense_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_status_id_seq OWNED BY public.expense_status.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    visit_id integer,
    user_id integer,
    date date NOT NULL,
    category_id integer,
    amount numeric(10,2),
    description text,
    bill_path text NOT NULL,
    status_id integer DEFAULT 2,
    approved_by integer,
    approved_at timestamp without time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    receipt_id character varying(100) NOT NULL,
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: monthly_balance_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.monthly_balance_view AS
 SELECT e.user_id,
    EXTRACT(year FROM e.date) AS year,
    EXTRACT(month FROM e.date) AS month,
    sum(
        CASE
            WHEN ((es.name)::text = 'Approved'::text) THEN e.amount
            ELSE (0)::numeric
        END) AS total_expense,
    a.amount AS advance,
    (sum(
        CASE
            WHEN ((es.name)::text = 'Approved'::text) THEN e.amount
            ELSE (0)::numeric
        END) - a.amount) AS balance
   FROM ((public.expenses e
     JOIN public.expense_status es ON ((es.id = e.status_id)))
     LEFT JOIN public.advances a ON (((a.user_id = e.user_id) AND ((a.year)::numeric = EXTRACT(year FROM e.date)) AND ((a.month)::numeric = EXTRACT(month FROM e.date)))))
  GROUP BY e.user_id, (EXTRACT(year FROM e.date)), (EXTRACT(month FROM e.date)), a.amount;


--
-- Name: rejection_reason; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rejection_reason (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    deleted_on timestamp without time zone,
    deleted_by integer
);


--
-- Name: rejection_reason_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rejection_reason_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rejection_reason_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rejection_reason_id_seq OWNED BY public.rejection_reason.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100),
    email character varying(100),
    password character varying(255),
    role character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_by integer,
    deleted_on timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: visit_reason; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visit_reason (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    is_published boolean DEFAULT true,
    deleted_on timestamp without time zone,
    deleted_by integer
);


--
-- Name: visit_reason_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visit_reason_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visit_reason_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visit_reason_id_seq OWNED BY public.visit_reason.id;


--
-- Name: visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visits (
    id integer NOT NULL,
    user_id integer,
    visit_reason_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submitted boolean DEFAULT false,
    client_id integer,
    deleted_on timestamp without time zone,
    deleted_by integer,
    CONSTRAINT visits_check CHECK ((end_date >= start_date))
);


--
-- Name: visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visits_id_seq OWNED BY public.visits.id;


--
-- Name: advances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advances ALTER COLUMN id SET DEFAULT nextval('public.advances_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: expense_category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_category ALTER COLUMN id SET DEFAULT nextval('public.expense_category_id_seq'::regclass);


--
-- Name: expense_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status ALTER COLUMN id SET DEFAULT nextval('public.expense_status_id_seq'::regclass);


--
-- Name: expense_status_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status_history ALTER COLUMN id SET DEFAULT nextval('public.expense_status_history_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: rejection_reason id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rejection_reason ALTER COLUMN id SET DEFAULT nextval('public.rejection_reason_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visit_reason id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_reason ALTER COLUMN id SET DEFAULT nextval('public.visit_reason_id_seq'::regclass);


--
-- Name: visits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits ALTER COLUMN id SET DEFAULT nextval('public.visits_id_seq'::regclass);


--
-- Name: advances advances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_pkey PRIMARY KEY (id);


--
-- Name: advances advances_user_id_year_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_user_id_year_month_key UNIQUE (user_id, year, month);


--
-- Name: clients clients_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_name_key UNIQUE (name);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: expense_category expense_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_category
    ADD CONSTRAINT expense_category_name_key UNIQUE (name);


--
-- Name: expense_category expense_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_category
    ADD CONSTRAINT expense_category_pkey PRIMARY KEY (id);


--
-- Name: expense_status_history expense_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status_history
    ADD CONSTRAINT expense_status_history_pkey PRIMARY KEY (id);


--
-- Name: expense_status expense_status_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status
    ADD CONSTRAINT expense_status_name_key UNIQUE (name);


--
-- Name: expense_status expense_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status
    ADD CONSTRAINT expense_status_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: rejection_reason rejection_reason_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rejection_reason
    ADD CONSTRAINT rejection_reason_name_key UNIQUE (name);


--
-- Name: rejection_reason rejection_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rejection_reason
    ADD CONSTRAINT rejection_reason_pkey PRIMARY KEY (id);


--
-- Name: expenses unique_receipt_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT unique_receipt_id UNIQUE (receipt_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visit_reason visit_reason_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_reason
    ADD CONSTRAINT visit_reason_name_key UNIQUE (name);


--
-- Name: visit_reason visit_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visit_reason
    ADD CONSTRAINT visit_reason_pkey PRIMARY KEY (id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: advances advances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: clients clients_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: clients clients_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: expense_status_history expense_history_rejection_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status_history
    ADD CONSTRAINT expense_history_rejection_fk FOREIGN KEY (rejection_reason_id) REFERENCES public.rejection_reason(id);


--
-- Name: expense_status_history expense_history_status_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status_history
    ADD CONSTRAINT expense_history_status_fk FOREIGN KEY (status_id) REFERENCES public.expense_status(id);


--
-- Name: expense_status_history expense_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status_history
    ADD CONSTRAINT expense_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: expense_status_history expense_status_history_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_status_history
    ADD CONSTRAINT expense_status_history_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: expenses expenses_category_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_category_fk FOREIGN KEY (category_id) REFERENCES public.expense_category(id);


--
-- Name: expenses expenses_status_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_status_fk FOREIGN KEY (status_id) REFERENCES public.expense_status(id);


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: expenses expenses_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: visits visits_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: visits visits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: visits visits_visit_reason_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_visit_reason_fk FOREIGN KEY (visit_reason_id) REFERENCES public.visit_reason(id);


--
-- PostgreSQL database dump complete
--

\unrestrict C4Jcf0mmuKgUn0WD5JhDdt86KiWuxsybGOVWltMDbuAcoV0wPs0wDI89JYoGiHc

--
-- PostgreSQL database dump
--

\restrict zO4cXPhm7DftHgH7nJkXVxXjIPeqjCa16v9HTYhtopSgzAcx3K33jIL2IqZ5t1u

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, name, email, password, role, is_active, created_at, deleted_by, deleted_on) VALUES (1, 'Admin1', 'admin1@test.com', '123', 'Admin', true, '2026-02-19 18:33:01.639723', NULL, NULL);
INSERT INTO public.users (id, name, email, password, role, is_active, created_at, deleted_by, deleted_on) VALUES (2, 'Employee1', 'emp1@test.com', '456', 'Employee', true, '2026-02-19 18:33:01.639723', NULL, NULL);
INSERT INTO public.users (id, name, email, password, role, is_active, created_at, deleted_by, deleted_on) VALUES (3, 'Employee2', 'emp2@test.com', 'emp2', 'Employee', true, '2026-02-19 18:33:01.639723', NULL, NULL);
INSERT INTO public.users (id, name, email, password, role, is_active, created_at, deleted_by, deleted_on) VALUES (4, 'Employee3', 'emp3.surname@samprama.com', 'emp3', 'Employee', true, '2026-02-19 18:33:01.639723', NULL, NULL);
INSERT INTO public.users (id, name, email, password, role, is_active, created_at, deleted_by, deleted_on) VALUES (5, 'Test User1', 'test1@mail.com', 'test1', 'employee', true, '2026-02-20 11:44:36.026119', NULL, '2026-02-20 11:46:05.304005');


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.clients (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (2, 'Demo Client', NULL, '2026-02-18 18:23:27.721888', NULL, true, NULL, NULL);
INSERT INTO public.clients (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (1, 'ABC Manufacturing Pvt Ltd', 'ports manufacturer', '2026-02-18 18:23:27.721888', NULL, true, NULL, NULL);


--
-- Data for Name: expense_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.expense_category (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (1, 'Travel', NULL, '2026-02-17 16:21:12.777241', NULL, true, NULL, NULL);
INSERT INTO public.expense_category (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (2, 'Food', NULL, '2026-02-17 16:21:12.777241', NULL, true, NULL, NULL);
INSERT INTO public.expense_category (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (3, 'Petrol', NULL, '2026-02-17 16:21:12.777241', NULL, true, NULL, NULL);
INSERT INTO public.expense_category (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (4, 'Material', NULL, '2026-02-17 16:21:12.777241', NULL, true, NULL, NULL);
INSERT INTO public.expense_category (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (5, 'Other', NULL, '2026-02-17 16:21:12.777241', NULL, true, NULL, NULL);
INSERT INTO public.expense_category (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (6, 'Toll updated', NULL, '2026-02-17 17:41:15.342216', 1, false, '2026-02-18 14:55:07.748475', 1);
INSERT INTO public.expense_category (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (7, 'Courier', 'Courier charges', '2026-02-19 11:26:30.22821', 1, false, NULL, NULL);


--
-- Data for Name: expense_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.expense_status (id, name, deleted_on, deleted_by) VALUES (1, 'Pending', NULL, NULL);
INSERT INTO public.expense_status (id, name, deleted_on, deleted_by) VALUES (2, 'Submitted', NULL, NULL);
INSERT INTO public.expense_status (id, name, deleted_on, deleted_by) VALUES (3, 'Approved', NULL, NULL);
INSERT INTO public.expense_status (id, name, deleted_on, deleted_by) VALUES (4, 'Rejected', NULL, NULL);


--
-- Data for Name: rejection_reason; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.rejection_reason (id, name, deleted_on, deleted_by) VALUES (1, 'Bill not clear', NULL, NULL);
INSERT INTO public.rejection_reason (id, name, deleted_on, deleted_by) VALUES (2, 'Amount mismatch', NULL, NULL);
INSERT INTO public.rejection_reason (id, name, deleted_on, deleted_by) VALUES (3, 'Policy violation', NULL, NULL);
INSERT INTO public.rejection_reason (id, name, deleted_on, deleted_by) VALUES (4, 'Duplicate entry', NULL, NULL);


--
-- Data for Name: visit_reason; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (1, 'Client Site Installation', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (2, 'Device Maintenance / Service', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (3, 'Network / Gateway Setup', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (4, 'IoT Device Deployment', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (5, 'Troubleshooting / Issue Resolution', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (6, 'Site Survey', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (7, 'Client Meeting / Technical Discussion', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (8, 'Training / Demonstration', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (9, 'Internal Field Testing', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (10, 'Emergency Breakdown Support', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (11, 'Other/ Internal Office Work', NULL, '2026-02-17 16:22:09.161328', NULL, true, NULL, NULL);
INSERT INTO public.visit_reason (id, name, description, created_on, created_by, is_published, deleted_on, deleted_by) VALUES (12, 'Client Meeting', 'External client visit', '2026-02-20 11:39:37.211986', 1, false, '2026-02-20 11:42:21.859495', NULL);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 2, true);


--
-- Name: expense_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_category_id_seq', 7, true);


--
-- Name: expense_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_status_id_seq', 4, true);


--
-- Name: rejection_reason_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rejection_reason_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: visit_reason_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visit_reason_id_seq', 12, true);


--
-- PostgreSQL database dump complete
--

\unrestrict zO4cXPhm7DftHgH7nJkXVxXjIPeqjCa16v9HTYhtopSgzAcx3K33jIL2IqZ5t1u

