import mongoose from "mongoose";
const postSchema=new mongoose.Schema({
    image:{
        public_id:{
           type:String,
           default:''
        },
        url:{
            type:String,
            default:''
        }
    },
    caption:{
        type:String,
        default:''

    },
    location:{
        type:String,

    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User_Soc',
        required:true,  
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
                ref:'User_Soc'
        }
    ],
    comments:[
        {
            user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User_Soc'
        },
        comment:{
            type:String
        }
    }
    ],
    shared:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User_Soc',
        }
    ],
    saved:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User_Soc'
        }
    ],
    updateHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'PostHistory',
        }
    ],
    mentions:[
        {
        type:mongoose.Schema.Types.ObjectId,
            ref:'User_Soc'
        }
    ]
},{
    timestamps:true 
})

const Post=mongoose.model('Post',postSchema)   
export default Post
