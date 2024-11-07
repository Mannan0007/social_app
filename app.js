import express from "express"
import dotenv from "dotenv"
import userRouter from "./routes/userRoute.js";
import path from 'path';


dotenv.config({path:"./config/config.env"});

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));



app.use("/api/v1/user",userRouter)  //yeh ke middlewhere hai 

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.get('/',(req,res)=>{
    // res.send('hello from the server')
    res.render("home",{
        title:"Social.ly",
    });
});

app.get('/login',(req,res)=>{
    // res.send('hello from the server')
    res.render("login",{
        title:"login",
    });
});

export default app;