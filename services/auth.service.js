const pool = require('../config/db');

// Create Employee
const createEmployee = async (data) => {

    const role = (data.role || 'employee').toLowerCase();

    const query = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, LOWER(role) as role;
    `;

    const values = [
        data.name,
        data.email,
        data.password,
        role
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Check existing email
const findUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;

    const result = await pool.query(query, [email]);
    
    return result.rows[0];
};

module.exports = {
    createEmployee,
    findUserByEmail
};
