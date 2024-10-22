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
import { idNotFoundMessage, userAlreadyVerifiedMessage, userNotFoundMessage } from "../utils/message.js";

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
        console.log("1");

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
            return Response(res,400,false,idNotFoundMessage)

        }
        //Find user
        let user= await User.findById(id);
        if(!user){
            return Response(res,404,userNotFoundMessage)
        }


        //If user already verified 
        if(user.isVerified){
            return Response(res,400,false,userAlreadyVerifiedMessage)
        }

        //if otp attempt is not locked
        if(user.otpLockUntil>Date.now()){
            user.otpExpire=undefined;
            user.otpAttempts=0;
            await user.save();

            return Response(res,400,false,`Try again after ${Math.floor((user.otpLockUntil-Date.now())%(60*1000))}
            minutes and ${Math.floor((user.otpLockUntil-Date.now())%(1000))}seconds`)
        }

    }catch(error){
        // res.status(500).json({
        //     success:false,
        //     message:error.message
        // })

        //yaha se se status ka hta dia kyumki response.js mein baar baar  use hone wala code daal dia 
        Response(res,500,false,error.message)

        

    }
}