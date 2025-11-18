// import mongoose from "mongoose";
// import {DB_NAME} from "./constants";
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()







/* import express from "express"
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MOBGODB_URI}/${DB_NAME}`)// db ko connect kiya
        app.on("error", (error) => {
            console.log("ERRR: ", error)
            throw error
        })// port ko listen krta hai

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
        
    }

})() */