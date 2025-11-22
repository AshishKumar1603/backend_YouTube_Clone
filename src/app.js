import express from "express";
// Third-party: cors(), cookieParser(), multer, helmet, express-rate-limit
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({   //Backend ko frontend se request accept karne ki permission deni padti hai.
    origin: process.env.CORS_ORIGIN, //origin → Kaunse URL se request allow hai
    Credentials: true //credentials: true → Cookies, tokens, sessions allow karne ke liye
}))
 // types of middleware :Built-in: express.json(), express.urlencoded(), express.static()
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))// it create a public asset whicch store images and other asses.
app.use(cookieParser())

export { app }; // url se jb bhi koi data aata hai wo req.params se hi aata hai. ()