import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        trim:true
    },
    lastname:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    orderemail:{
        type:String
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        
    },
    state:{
        type:String,
        
    },
    pincode:{
        type:String,
        
    },
    country:{
        type:String,
       
    },
    address:{
        type:String,
    },
    address1:{
        type:String,
    },
    role:{
        type:Number,
        default:0
    },
    otp:{
        type:Number,
    }
},{timestamps:true});

export default mongoose.model('users',userSchema);