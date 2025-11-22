// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js";
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config({ 
    path: './.env'
})

connectDB()
.then( ()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log(` Server is running at port : ${process.env.PORT}`);

        // app.on("error", (error) => {
        //     console.log("ERRR: ", error)
        //     throw error
        // });
    })
})
.catch( (error) => {
    console.log("MONGO db connection failed !!! ", error)
})

// app.listen(process.env.PORT || 8000, () => {
//         console.log(` Server is running at port : ${process.env.PORT}`);
// })




/*import express from "express"
const app = express() //Yeh object tumhari puri application ko represent karta hai.Isko hi later port pe start karoge.


( async () => {
    try {
        await mongoose.connect(`${process.env.MOBGODB_URI}/${DB_NAME}`)// await lagaya so that:Execution yahin ruk jayeJab tak database connect nahi hota, server आगे ना बढे

        app.on("error", (error) => {
            console.log("ERRR: ", error)
            throw error
        }) //Ye ek event listener hai jo express app ke internal errors ke liye hai.Agar server while running koi internal error throw kare → yeh chalega.

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })//Server ko start kar raha specific port par

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
        
    } // try-catch: Iska purpose: agar DB connection fail ho jaye, to server crash na ho silently.

})() //Yeh ek Immediately Invoked Async Function Expression (IIFE) hai.
// Iske andar await use kar sakte ho (top-level pe nahi hota older Node versions me)

//Yeh function turant execute ho jata hai — bina kisi manual function call ke */