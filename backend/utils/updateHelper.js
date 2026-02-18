const buildUpdateQuery = (table, id , data, allowedFields) => {
    const keys =[];
    const values =[];

    let index =1;

    // update only allowed & given fields
    for (const field of allowedFields) {
        if (data[field] !== undefined){
            keys.push(`${field} = $${index}`);
            values.push (data[field]);

            index++ 
        }

    }
    // if no fields given 
    if (keys.length===0){
        throw new Error('No valid fields provided for update.');
    }

    values.push(id);

    const query = `UPDATE ${table}
                SET ${keys.join(', ')}

                WHERE id =$${index}

                returning * ;`

    return {query, values};


}

module.exports ={buildUpdateQuery}