import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //Async isliye, kyunki DB connect hone me time lagta hai.Without async/await, code aage badh jaata aur server crash hota.
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error: ", error)
        process.exit(1)
        
    }
}

export default connectDB

/* Is DB connect function me kaise connection hota hai — Summary:

Function call hota → connectDB()

mongoose.connect() chalti hai

Connection string parse hoti

DNS resolve hota

Mongo server se TCP + SSL handshake hota

Auth check hoti

Connection pool banata

Success return hota → connectionInstance */