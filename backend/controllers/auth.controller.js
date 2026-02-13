const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authService = require('../services/auth.service');

require('dotenv').config();

const login= async (req, res) => {
    try{
        const {email, password} = req.params;

        if (!email || !password)
        {
            return res.status(400).json({message: 'Email and Password is required'});

        }

        const user = await authService.findUserByEmail(email);

        if (!user) 
        {
            return res.status(400).json({message : 'Invalid Email '});

        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
        {
            return res.status(400).json({message: 'Invalid Password'});
        }

        const token = jwt.sign(
           { id : user.id,
            role : user.role},

            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }

        )

        res.json({
            success: true,
            token : token ,

            user: {
                id: user.id, 
                name:user.name,
                role:user.role
            }

        })

    
    }

    catch (error) {
        console.error('Login error : ', error);

        res.status(500).json({message: 'Server side Error'});
    }
}

module.exports = {login};