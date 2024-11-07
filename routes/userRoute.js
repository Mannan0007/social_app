import express from "express";
import { loginUser, registerUser,resendOTP,verifyUser } from "../controllers/userController.js";


const userRouter=express.Router();

userRouter.post('/register',registerUser)

userRouter.post('/verify/:id',verifyUser)   

userRouter.get('/resend-otp/:id',resendOTP)

userRouter.post("/login",loginUser);

export default userRouter