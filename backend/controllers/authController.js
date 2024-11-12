import User from "../models/User.js"
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "./generateTokenAndSetCookie.js"

export const signUp = async (req, res) => {
    try {
        const {fullName, username, email, password} = req.body
        if(!fullName || !username || !email || !password){
            console.log({fullName, username, email, password})
            return res.status(400).json({message: "All Fileds are Required!"})
        }
        
        const existingEmail = await User.findOne({email})
        const existingUsername = await User.findOne({username})

        if(existingEmail || existingUsername) 
            return res.status(400).json({message: "Duplicate, Email, Username Already Taken"})
        
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = {fullName, username, email, password: hashedPassword}
                    
        const createdUser = await User.create(newUser)
        
        if(createdUser) {
            // Explicitly set headers
            // res.setHeader('Content-Type', 'application/json');
            console.log("Account Created Successfully")
            generateTokenAndSetCookie(createdUser._id, res);
            res.status(201).json({createdUser})
        }
        
        else return res.status(400).json({message: 'Unable to create the user'})

    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(500).json({message: 'Internal Server Error: '+ error.message})
    }
}

export const login = async (req, res) => {
    try {
        const {username, password} = req.body
        if(!username || !password) 
            return res.status(400).json({message: "All Fields Are Required"})

        const existingUser = await User.findOne({username})
        
        if(!existingUser) return res.status(400).json({message: 'User Not Found'})

        const passwordMatch = await bcrypt.compare(password, existingUser.password)
        if(!passwordMatch) return res.status(400).json({message: 'Incorrect Password'})

/*         const accessToken = jwt.sign(
            {id: existingUser._id},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )  
       if(!accessToken) return res.status(401).json({message: 'Unable to generate the token'}) */
        // generate refresh token
        generateTokenAndSetCookie(existingUser._id, res)

        res.status(201).json({user: existingUser})

    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error: '+ error})
    }
}

export const logout = async (req, res) => {
    try {
        const { jwt } = req.cookies
        if(!jwt) return res.status(204).json({message: 'No JWT Provided'})

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        res.status(201).json({message: "cookie cleared successfuly"})
        
        
    } catch (error) {
        console.log(error)
    }
}
