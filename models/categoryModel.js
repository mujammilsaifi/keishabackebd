import mongoose from "mongoose";
const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    
    slug:{
        type:String,
        lowercase:true
    },
    url:{
        type:String,  
    },
    publicid:{
        type:String,  
    }
});
export default mongoose.model("Category",categorySchema);