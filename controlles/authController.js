import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
    const { username, email, password, monthly_budget } = req.body
    if(!email || !password){
        return res.status(400).json({
            error: "Email and password could not be empty"
        })
    }
    try{
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(userCheck.rows.length > 0){
            return res.status(400).json({
                error: "User already exists"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

       const newUser = await pool.query(
            'INSERT INTO users (username, email, hashed_password, monthly_budget) VALUES ($1, $2, $3, $4) RETURNING id, username, email, monthly_budget, created_at',
            [username, email, hashedPassword, monthly_budget]
        );
        
        res.status(200).json({
            status: "User registred succefully",
            user: newUser.rows[0]
        })
    } catch(error){
        res.status(500).json({error: error.message})
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    if(!email || !password){
        return res.status(400).json({error: "Email and password is required"})
    }
    try{
        // check if the uswer is registered
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if(userExist.rows.length == 0){
            return res.status(401).json({error: "Invalid credietials"})
        }

        // verify password 
        const user = userExist.rows[0]
        const isMatch = await bcrypt.compare(password, user.hashed_password)
        if(!isMatch){
            return res.status(401).json({error: "Invalid credientials"})
        }
        const payload = {userId: user.id}
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '2h'})

        res.status(200).json({
            status: "Login successfully",
            token: token,
            user: {
                id: user.id,
                name: user.username,
                email: user.email
            }
        })

    } catch(error){
        res.status(500).json({error: error.message})
    }
}

export const getAllUsers = async (req, res) => {
    try{
        const users = await pool.query('SELECT id, username, email, monthly_budget, created_at FROM users')
     
        res.status(200).json({users: users.rows})
       
    } catch(error){
        res.status(404).json({error: "User not found"})
    }
}

export const getById = async (req, res) => {
    const { id } = req.params;
    try{
        const user = await pool.query('SELECT id, username, email, monthly_budget, created_at FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user.rows[0])
    } catch(error) {
        res.status(500).json({error: error.message})
    }
}

export const updateBudget = async (req, res) => {
    const { budget } = req.body;
    // We can pull the userId straight from the JWT auth token if we protect this route
    const userId = req.user.userId; 

    if (budget === undefined || budget < 0) {
        return res.status(400).json({ error: "Please provide a valid budget amount greater than or equal to 0." });
    }

    try {
        const updated = await pool.query(
            'UPDATE users SET monthly_budget = $1 WHERE id = $2 RETURNING id, username, monthly_budget',
            [budget, userId]
        );
        res.status(200).json({ status: "Budget updated successfully", user: updated.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};