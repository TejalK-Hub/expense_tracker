const express = require('express');

const cors = require('cors');

require('dotenv').config();

const pool = require('./config/db');

const app = express();

app.use(cors());

app.use(express.json());


const PORT = 5001;

//basic health check for server 
app.get('/health', (req, res) => {
    res.send('Server working');
});

//db connection health check 
app.get('/health/db', async (req,res)=> {
    try{
        const result = await pool.query('SELECT NOW()');

        res.json({
            status: 'Database connected',
            time: result.rows[0]
        })

    }
    catch(error) {
        console.error(error);

        res.status(500).json({
            status: 'Database connection failed'
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} and DATABASE is connected`);
});
