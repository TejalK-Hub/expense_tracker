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



const authRoutes = require('./routes/auth.routes');        // Optional (for  login only)

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());



const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const testmiddleware = (req,res,next)=>
{
    console.log(" req url", req.url);

    next ();
}

// Expense Summary (specific path first)
app.use('/expenses/summary', expenseSummaryRoutes);

// User expense routes (employee)
app.use('/expenses', testmiddleware, expenseRoutes);

// Admin expense routes (keep last to avoid shadowing)
app.use('/expenses', expenseAdminRoutes);

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

// Auth (login only,and optional )
app.use('/auth', authRoutes);

// Internal Generic CRUD engine (not for UI)
app.use('/internal', dataRoutes);

// Optional alias for users only (if UI needs raw CRUD)
app.use('/users', dataRoutes);

// Dashboard
app.use('/dashboard', dashboardRoutes);

// UI Display APIs
app.use('/visits', visitsRoutes);




//expense route
app.use('/expenses', testmiddleware, expenseRoutes);


// Server

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});


