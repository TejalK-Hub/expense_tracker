const pool = require('../config/db');

const findUserByEmail = async (email) => {
    const query = `SELECT id, name, email, password, role
    FROM users
    WHERE email = $1`;

    const result= await pool.query(query, [email]);

    return resulty.rows[0];
}

module.exports = { 
    findUserByEmail

};



