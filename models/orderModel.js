import mongoose from "mongoose";
const orderSchema=new mongoose.Schema({
    product:{}
    ,
    payment:{},
    buyer:{
        type:mongoose.ObjectId,
        ref:'users'
    },
    status:{
        type:String,
        default:"Processing",
        
    },
},{timestamps:true});
export default mongoose.model("Order",orderSchema);