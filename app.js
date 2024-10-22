import express from "express"
import dotenv from "dotenv"
import userRouter from "./routes/userRoute.js";


dotenv.config({path:"./config/config.env"});

const app=express();
app.use(express.json());


app.get('/',(req,res)=>{
    res.send('hello from the server')
})

app.use("/api/v1/user",userRouter)  //yeh ke middlewhere hai 

export default app;