const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

// Routes
const dataRoutes = require('./routes/master.routes');      // Generic CRUD
const dashboardRoutes = require('./routes/dashboard.routes');
const visitsRoutes = require('./routes/visits.routes');
const expenseRoutes = require('./routes/expense.routes');
const expenseAdminRoutes = require('./routes/expense.admin.routes');

const expenseSummaryRoutes = require('./routes/expense.summary.routes');

const expenseActionRoutes = require('./routes/expense.action.routes');

//const authRoutes = require('./routes/auth.routes');        // Optional (for  login only)

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use(cors());
app.use(express.json());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/expenses', expenseAdminRoutes);

app.use('/expenses', expenseActionRoutes);

app.use('/expenses/summary', expenseSummaryRoutes);

const PORT = process.env.PORT || 5001;



// Server health
app.get('/health', (req, res) => {
    res.send('Server working');
});

// Database health
app.get('/health/db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            status: 'Database connected',
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'Database connection failed'
        });
    }
});


// Internal Generic CRUD engine (not for UI)
app.use('/internal', dataRoutes);

// Optional alias for users only (if UI needs raw CRUD)
app.use('/users', dataRoutes);

// Dashboard
app.use('/dashboard', dashboardRoutes);

// UI Display APIs
app.use('/visits', visitsRoutes);

//expense route
app.use('/expenses', expenseRoutes);

// Auth (login only,and optional )
//app.use('/auth', authRoutes);



// Server

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
