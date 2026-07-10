import jwt from 'jsonwebtoken'

export const authenticatedToken = (req, res, next) => {
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        res.status(401).json({error: "Access denied. No token provided"})
    }

    try {
        // verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        // Attach the decoded payload (which has { userId: user.id }) to the req object
        req.user = verified;
        // go to the next function (to the main expence controller)
        next()
    } catch(error){
        res.status(403).json({eror: "Invalid or expired token"})
    }

}