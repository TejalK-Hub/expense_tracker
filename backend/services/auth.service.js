const pool = require('../config/db');

const findUserByEmail = async (email) => {
    try {
        const query = `
            SELECT id, name, email, password, role
            FROM users
            WHERE email = $1
        `;

        const result = await pool.query(query, [email]);

        return result.rows[0]; // returns user or undefined

    } catch (error) {
        console.error('Auth Service Error:', error);
        throw error;
    }
};

module.exports = {
    findUserByEmail
};
