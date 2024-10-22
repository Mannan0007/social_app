import { connect } from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on ${process.env.PORT}`)
})