import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please add a first name"],
    minlength: [3, "First Name must be at least 3 characters"],
  },
  middleName: {
    type: String, 
  },
  lastName: {
    type: String,
    required: [true, "Please add a last name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: [8, "Password must be atleast 8 characters long"],
  },
  dob: {
    type: Date,
    required: [true, "Please add a date of Birth"],
    default: Date.now,
  },
  mobile: {
    type: Number,
    required: [true, "Please add a mobile Number"],
    minlength: [10, "mobile number must be atleast 10 digits"],
    maxlength: [10, "mobile number must be atleast 10 digits"],
    unique:true,
  },
  username: {
    type: String,
    required: [true, "Please add your username"],
    unique: true,
  },
  bio: {
    type: String,
    maxlength: [200, "Bio must be atmost 200 characters"],
    default:' ',
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
    default: "male",
  },
  avatar: {
    public_id: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User_Soc",
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User_Soc",
  }],
  
  isAdmin: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: Number,
  },
  otpExpire: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  isVerified:{
    type:Boolean,
    default:false,
  },
  loginAttempt: {
    type: Number,
    default: 0,
  },
  lockUntil:{
    type:Date,
  },
  otpAttempts:{
    type:Number,
    default:0,
  },
  otpLockUntil:{
    type:Date,
  },
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  updateHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UpdateHistory",
    },
  ],
},
{
  timestamps:true,
}
);


userSchema.pre('save',async function (next) {
  if(!this.isModified('password')){
    next();
  }
  const salt=await bcrypt.genSalt(10);
  this.password=await bcrypt.hash(this.password,salt);
  next();
});

const User=mongoose.model('User_Soc',userSchema)
//pehle wala user{model} wo hai jo schema bna rha hai  dusra user{collection} yeh hai ki new user banega wo iss se store hoga
export default User;