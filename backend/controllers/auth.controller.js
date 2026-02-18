const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

require('dotenv').config();


//  email validation 
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};



// Employee Signup

const signup = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        // Normalize input
        if (email) {
            email = email.trim().toLowerCase();
        }

        if (name) {
            name = name.trim();
        }

        // Required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, Email and Password are required"
            });
        }

        // Email format validation
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Check existing user
        const existing = await authService.findUserByEmail(email);

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Create Employee
        const user = await authService.createEmployee({
            name,
            email,
            password
        });

        return res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Signup Error:', error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Login

const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        // Normalize
        if (email) {
            email = email.trim().toLowerCase();
        }

        // Required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Email format validation
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Find user
        const user = await authService.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Password check 
        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    login,
    signup
};
