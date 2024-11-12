import jwt from 'jsonwebtoken'

export const protectRoute = async(req, res, next) => {
    try {
        const {jwt: token} = req.cookies;
        if(!token) return res.status(400).json({message: "Token is Required"})

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden, Token expired' })
            
            req.userId = decoded.userId
            next()
        }
    )    
    } catch (error) {
        res.status(501).json({message: "Unable to decode the token"})
    }
}
