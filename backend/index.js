import express, { urlencoded } from "express";
import dotenv from "dotenv";
import { dbConnect } from "./db/dbConnection.js";
import cookieParser from "cookie-parser";
import upload from "express-fileupload";
import path from 'path'
import { fileURLToPath } from "url";

import {v2 as cloudinary} from "cloudinary"

import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Enable this for https
})

/* This will parse multipart/form-data requests
useful when using form-data */
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
// this configuration is important when using cloudinary
app.use(upload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use("/auth", authRouter)
app.use("/users", userRouter)
app.use("/posts", postRouter)
app.use("/notifications", notificationRouter)

// Serve static files from the React/Vite app
app.use(express.static(path.join(__dirname, '/frontend/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '/frontend/dist/index.html'))});

/* // Add a catch-all route for debugging
app.use((req, res) => {
    console.log(`Received request for ${req.method} ${req.url}`);
    res.status(404).json({ message: "Route not found" });
}); */
/* app.get("/file", (req, res) => {
    res.send("sdfklhuqdhfqdhfod")
})
 */
app.listen(process.env.PORT, async () => {
    console.log(`Server Running at: ${process.env.PORT}`);
    try {
      await dbConnect();
    } catch (error) {
      console.error("Failed to connect to database:", error);
      process.exit(1);
    }
});
