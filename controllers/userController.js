// import { sendEmail } from "../middleware/sendMail.js"
// import User from "../models/userModel.js"
// export const registerUser=async(req,res)=>{
//     try {   //agar user register krwane hai tp
//         //Parsing the body data

//         const {firstName,middleName,lastName,mobile,dob,username,gender,email,password,bio}=req.body
        
//         //checking the body data   ki saari fields hai naaa 
//         if(!firstName || !lastName || !mobile|| !email|| !password || !dob|| !username|| !gender){
//             res.status(400).json({
//                 success:false,
//                 message:"Provide all required fields"
//             })
//         }

//         //check if user exist 
//         let user=await User.findOne({email})   //email ke liye 
//         if(user){
//             return res.status(400).json({
//                 success:false,
//                 message:'Email Already registered',
//             })
//         }
//         user=await User.findOne({mobile})  //phone number ke liye 
//         if(user){
//             return res.status(400).json({
//                 success:false,
//                 message:'Mobile Already registered',
//             })
//         }
//         user=await User.findOne({username})   //username ke liye 
//         if(user){
//             return res.status(400).json({
//                 success:false,
//                 message:'Username Already registered',
//             })
//         }
        

//         //Password Hashing 
//         //already done in userSchema userModel mein

//         //create user

//         user =await User.create({...req.body})


//         //OTP generation 
//         const otp=Math.floor(100000+Math.random()*900000);
//         if(otp===1000000){
//             otp=999999
//         }
//         const otpExpire=new Date(Date.now()+10*60*1000);
//         user.otp=otp;
//         user.otpExpire=otpExpire;
//         await user.save();

//         //Email verification 

//         const subject="Email Verification";
//         const message=`Your OTP is ${otp}`;

//         await sendEmail({
//             email,
//             subject,
//             message
//         })

//         //send response 
//         res.status(201).json({
//             success:true,
//             message:"User Successfully created",
//             user
//         })

//         //bs ab hogya 

//     } catch (error) {    //yeh error catch krne ke liye hai 
//         res.status(500).json({
//             success:false,
//             message:error.message
//         })
        
//     }
    
// }

import User from "../models/userModel.js"
import { Response } from "../utils/response.js";
import { sendEmail } from "../middleware/sendMail.js";
import { message} from "../utils/message.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";


const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)

let emailTemplate=fs.readFileSync(path.join(__dirname,'../templates/mail.html'),'utf-8')




export const registerUser=async(req,res)=>{
    try {
        //parsing body
        const {
            firstName,
            middleName,
            lastName,
            mobile,
            dob,
            username,
            gender,
            email,
            password,
            bio,
          } = req.body;

        console.log(req.body);

        //check body data
        if (!firstName || !lastName || !mobile || !dob || !username || !gender || !email || !password) {
            return res.status(400).json({
              success: false,
              message: "Provide all required details",
            });
          }

        //check if user exists
        let user =await User.findOne({email})
        if(user){
            return res.status(400).json({
                success:false,
                message:'Email already exists'
            })
        }
        user =await User.findOne({username})
        if(user){
            return res.status(400).json({
                success:false,
                message:'Username already exists'
            })
        }
        user =await User.findOne({mobile})
        if(user){
            return res.status(400).json({
                success:false,
                message:'Mobile Number already exists'
            })
        }
         

        // create user
        user =await User.create({...req.body});   //Spread Operator

        //OTP generation
        const otp=Math.floor(100000 + Math.random()*900000);
        const otpExpire=new Date(Date.now() + 10 * 60 *1000);

        user.otp=otp;
        user.otpExpire=otpExpire;
        await user.save();

        // Email verification
        const subject="Email verification";
        const message=`Your OTP is ${otp}`;
        await sendEmail({
            email,subject,message
        })



        //send response
        res.status(201).json({
            success:true,
            message:"User created successfully",
            user
        }) 


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



export const verifyUser=async(req,res)=>{
    try{
        //fetching 
        const {id}=req.params;
        const {otp}=req.body;


        //id and otp
        if(!id){
            return Response(res,400,false,message.idNotFoundMessage)

        }
        //Find user
        let user= await User.findById(id);
        if(!user){
            return Response(res,404,message.userNotFoundMessage)
        }


        //If user already verified 
        if(user.isVerified){
            return Response(res,400,false,message.userAlreadyVerifiedMessage)
        }

        //if otp attempt is not locked
        if(user.otpLockUntil>Date.now()){
            user.otpExpire=undefined;
            user.otpAttempts=0;
            await user.save();

            return Response(res,400,false,`Try again after ${Math.floor((user.otpLockUntil-Date.now())%(60*1000))}
            minutes and ${Math.floor((user.otpLockUntil-Date.now())%(1000))}seconds`)
        }

        //Check otp attemps

        if(user.otpAttempts>=3){
            user.otp=undefined;
            user.otpExpire=undefined;
            user.otpAttempts=0;
            user.otpLockUntil=Date.now()+process.env.OTP_LOCK_TIME*60*1000;
            await user.save();

            return Response(res,400,false,message.otpAttemptsExceedMessage)
        }

        //check otp 
        if(!otp){
            user.otpAttempts+=1;
            await user.save();

            return Response(res,400,false,message.otpNotFoundMessage)
        }

        //Check if the otp is expired 

        if(user.otpExpire<Date.now()){
            user.otp=undefined;
            user.otpAttempts=0;
            user.otpLockUntil=undefined;
            await user.save();

            return Response(res,400,false,message.otpExpiredMessage)
        }

        //if otp matches 

        if(user.otp!==otp){
            user.otpAttempts+=1;
            await user.save();
            return Response(res,400,false,message.otpInvalidMessage)
        }

        //Update User 

        user.isVerified=true;
        user.otp=undefined;
        user.otpExpire=undefined;
        user.otpAttempts=0;
        user.otpLockUntil=undefined;

        await user.save();


        //authenticate user 

        const token=await user.generateToken();
        const options={
            expires:new Date(Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000),
            httpOnly:true,
            sameSite:'none',
            secure:true
        }
        res.status(200).cookie('token',token,options).json({
            success:true,
            message:message.userVerifiedMessage,
            data:user,
        })


    }catch(error){
        // res.status(500).json({
        //     success:false,
        //     message:error.message
        // })

        //yaha se se status ka hta dia kyumki response.js mein baar baar  use hone wala code daal dia 
        Response(res,500,false,error.message)


        //check otp 
        //match otp 
        //check otp expire  
        //user authentication 
        //*otp_lock_time 
        

    }
}

export const resendOTP = async (req, res) => {
    try {
      // Fetching id
      const { id } = req.params;
  
      // Checking id
      if (!id) {
        return Response(res, 400, false, message.isNotFoundMessage);
      }
  
      // finding & checking user
      let user = await User.findById(id);
      if (!user) {
        return Response(res, 404, false, message.UserNotFoundMessage);
      }
  
      // Check if user is already verified
      if (user.isVerified) {
        user.otp = undefined;
        user.otpExpire = undefined;
        user.otpAttempts = 0;
        user.otpLockUntil = undefined;
        await user.save();
        return Response(res, 400, false, message.userAlreadyVerifiedMessage);
      }
  
      // generate otp
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
  
      //update user
      user.otp = otp;
      user.otpExpire = otpExpire;
      user.otpAttempts = 0;
      user.otpLockUntil = undefined;
      await user.save();
  
      // Email Generation
      const email = user.email;
      const subject = "Email Verification";
      const message = `Your OTP is ${otp}.It will expire in ${process.env.OTP_EXPIRE} minutes`;
      await sendEmail({
        email,
        subject,
        message,
      });
  
      // Send response
      return res.status(201).json({
        success: true,
        message: message.otpResendSuccessfully,
        user,
      });
    } catch (error) {
      Response(res, 500, false, error.message);
    }
  };



export const loginUser=async(req,res)=>{
    try{
        //Parsing the user 
        const{email,password}=req.body
        //checking the body 
        if(!email||!password){
            return Response(res,400,false,message.missingFieldMessage)
        }
        //Finding user
        let user=await User.findOne({email}).select('+password')

        //checking user 

        if(!user){
        
            return Response(res,404,false,message.userNotFoundMessage)
        }

        //if login is locked 

        if(user.lockUntil>Date.now()){
            user.loginAttempt=0;
            user.loginOtp=undefined;
            user.loginOtpExpire=undefined;
            await user.save();

            return Response(res,400,false,message.otpAttemptsExceedMessage)
        }
        //If login attempts exceed 

        if(user.loginAttempt>=process.env.LOGIN_ATTEMPTS){
            user.loginAttempt=0;
            user.loginOtp=undefined;
            user.loginOtpExpire=new Date(Date.now()+process.env.LOGIN_OTP_EXPIRE*60*1000);
            await user.save();
            return Response(res,400,false,message.otpAttemptsExceedMessage)
        }

        //Password matching 

        if(!await user.matchPassword(password)){
            user.loginAttempt+=1;
            await user.save();
            return Response(res,400,false,message.badAuthMessage)
        }

        //Generate otp 

        const loginOtp=Math.floor(100000+Math.random()*900000);
        const loginOtpExpire=new Date(Date.now()+process.env.LOGIN_OTP_EXPIRE*60*1000);

        //update user 

        user.loginAttempt=0;
        user.loginOtp=loginOtp;
        user.loginOtpExpire=loginOtpExpire;
        user.lockUntil=undefined;
        await user.save();

        //send otp 

        const subject ='Login verification';
        const body =`Your otp is ${loginOtp}.It will expire in ${process.env.LOGIN_OTP_EXPIRE}minutes`;
        

        emailTemplate=emailTemplate.replace('{{OTP_CODE}}',loginOtp)
        emailTemplate=emailTemplate.replace('{{PORT}}',process.env.PORT)
        emailTemplate=emailTemplate.replace('{{USER_ID}}',user._id.toString())
        emailTemplate=emailTemplate.replace('{{MAIL}}',process.env.SMTP_USER)


        await sendEmail({
            email:user.email,
            subject,
            message:body,
            html:emailTemplate
        })

        //Send Response 

        Response(res,200,true,message.otpSentMessage)

    }catch(error){
        Response(res,500,false,)
    }

}



