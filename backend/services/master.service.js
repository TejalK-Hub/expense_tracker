const pool = require('../config/db');

const getMasterByType = async (type) =>{
    const query =`SELECT id, value 
                FROM master_data 
                WHERE type = $1 AND is_active = true 
                ORDER BY value`; 

            //pass type as parameter
    const result = await pool.query(query, [type]);

    return result.rows
}

module.exports= {getMasterByType};