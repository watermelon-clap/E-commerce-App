const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('./../db/dbconn')

//registration
router.post('/api/register', async(req, res)=> {
    const { email, password, name } = req.body

    if(!email || !password) return res.json({ success: false, message: "Email and password are mandatory"})
    
    //validate email
    const regx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!regx.test(email)) return res.json({ success: false, message: "Invalid email"})

    

    try {
        //check whether email exists
        const [emailRows] = await db.query(
            `SELECT * FROM users WHERE email=?`,
            [email]
        ) 

        if(emailRows.length > 0) return res.json({ success: false, message: "User already exists."})

        //hash password
        const pHash = await bcrypt.hash(password, 10)

        const [rR] = await db.query(
            `INSERT INTO users(email, password, name) VALUES(?,?,?)`,
            [email, pHash, name]
        )
        if(!rR.affectedRows) return res.json({ success: false, message: "Error registering user"})
        return res.json({ success: true, message: "Registration successful"})
    }
    catch(err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

//login
router.post('/api/login', async(req,res) => {
    
    const { email, password } = req.body
    if(!email || !password) return res.json({ success: false, message: "Email and password are mandatory"})
    
    try {

        const [lR] = await db.query(
            `SELECT * FROM users WHERE email=?`,
            [email]
        )
        if(!lR.length) return res.json({ success: false, message: "Invalid email"})

        const hPw = lR[0].password

        const pMatch = await bcrypt.compare(password, hPw)

        if(!pMatch) return res.json({ success: false, message: "Wrong Password"})

        const user = {
            userid: lR[0].id_user
        }

        //generate token
        jwt.sign({user}, process.env.SECRETKEY, {expiresIn: '1d'}, (err,token) => {
            if(err) throw new Error()
            
                return res.json({
                    success: true,
                    token: token,
                    message: "Login succcessful",
                    userid: lR[0].id_user
                })
        })

    }
    catch(err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
    
})

module.exports = router