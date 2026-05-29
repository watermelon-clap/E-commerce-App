const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    const cookie = req.headers.cookie
    
    const token = cookie.split('=')[1]

    jwt.verify(
        token,
        process.env.SECRETKEY,
        (err, decoded) => {
            if(err) return res.sendStatus(403)
            
            req.user = decoded.user
            next()
        }
    )
}

module.exports = verifyToken