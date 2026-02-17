const pool = require('../config/db');


// CREATE VISIT
const createVisit = async (data) => {
    const query = `
        INSERT INTO visits 
        (user_id, visit_reason_id, start_date, end_date)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const values = [
        data.user_id,
        data.visit_reason_id,
        data.start_date,
        data.end_date
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};



// GET VISITS (ROLE BASED)
const getVisits = async (user) => {
    let query = `SELECT * FROM visits`;

    const values = [];

    // Employee 
    if (user.role === 'Employee') {
        query += ` WHERE user_id = $1`;
        values.push(user.id); //add ele at end of js array
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
};



// SUBMIT VISIT 
const submitVisit = async (visitId, user) => {

    // Employee can submit only self visit
    let query = `UPDATE visits
        SET submitted = true 
        WHERE id = $1`;

    const values = [visitId];

    if (user.role === 'Employee') {
        query += ` AND user_id = $2`;
        values.push(user.id);
    }

    query += ` RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
};



module.exports = {
    createVisit,
    getVisits,
    submitVisit
};
