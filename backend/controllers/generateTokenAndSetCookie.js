import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
    try {
       
        const token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "15d",
        });
        res.cookie('jwt', token, {
            maxAge: 15 * 24 * 60 * 60 * 1000,   // ms
            httpOnly: true, // prevent XSS attacks cross-site scripting attacks
            sameSite: "None", // CSRF attacks cross-site request forgery attacks
            secure: true,
        });

    } catch (error) {
       res.json({refreshTokenError: "Unable to generate a token"})
    }
};
