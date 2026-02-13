const express = require('express');

const cors = require('cors');

require('dotenv').config();

const pool = require('./config/db');

const masterRoute = require('./routes/master.routes');

const authRoutes = require('./routes/auth.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Health check
app.get('/health', (req, res) => {
    res.send('Server working');
});

// DB health check
app.get('/health/db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'Database connected',
            time: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'Database connection failed'
        });
    }
});

// Routes
app.use('/master', masterRoute);
app.use('/auth', authRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
