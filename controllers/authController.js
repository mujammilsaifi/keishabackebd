import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer"
import Mailgen from "mailgen";

const EMAIL="mujammilkhan00738@gmail.com"
const PASSWORD="jcwcsupgsokmttyu"
//POST REGISTER USER
export const registerController= async (req,res)=>{
    try {
        const {name,email,password,phone,address}=req.body;
        //validation
        if(!name){
            return res.send({message:"Name is required"})
        }
        if(!email){
            return res.send({message:"Email is required"})
        }
        if(!password){
            return res.send({message:"Password is required"})
        }
        if(!phone){
            return res.send({message:"Phone No. is required"})
        }
        
        
        //check user
        const exisitingUser=await userModel.findOne({email});
        //exisiting user
        if(exisitingUser){
            return res.status(200).send({
                success:false,
                message:"User Already Register please login"
            })
        }
        //register user
        const hashedPassword=await hashPassword(password)
        const user=await new userModel({firstname:name,email,phone,address,password:hashedPassword}).save();
        res.status(201).send({
            success:true,
            message:"User Register SuccessFully",
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in User Registration",
            error
        })
    }
}


//POST LOGIN USER
export const loginController=async(req,res)=>{
    try {
        const {email,password}=req.body
        // validation
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:"Invalid Email or Password"
            })
        }
        //check user
        const user =await userModel.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:"email is not register"
            })
        }
        const match= await comparePassword(password,user.password);
        if(!match){
            return res.status(200).send({
                success:false,
                message:"invalid password"
            })
        }
        //token
        const token=await JWT.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
        res.status(200).send({
            success:true,
            message:"Login Successfully",
            user:{
                _id:user._id,
                firstname:user.firstname,
                lastname:user.lastname,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role:user.role
            },
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in Login",
            error
        })
    }
}

//SEND OTP FOR FORGET PASSWORD
export const sendOTPController= async(req,res)=>{
    try {
        const {email}=req.body
        if(!email){
            res.status(400).send("Email is required")
        }
        
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:"Wrong email and Answer"
            })
        }
        const OTP = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        let config = {
            service : 'gmail',
            auth : {
                user: EMAIL,
                pass: PASSWORD
            }
        }

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
        theme: "default",
        product : {
            name: "Keisha Jewellery",
            link : 'https://mailgen.js/'
        }
    })

    let response = {
        body: {
            name : user?.firstname,
            intro: "Your recieved the OTP for Reset Password",
            outro: `Your OTP code is ${OTP}`
        }
    }

    let mail = MailGenerator.generate(response)

    let message = {
        from : EMAIL,
        to : "kmujammil02@gmail.com",
        subject: "Reset Password OTP",
        html: mail
    }

    transporter.sendMail(message)
    await userModel.findByIdAndUpdate(user._id,{otp:OTP},{new:true});
        res.status(200).send({
            success:true,
            message:"OTP Send Successfully",
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Something went wrong forget password!"});
    }
}
//VERIFY OTP HERE
export const varifyOTPController= async(req,res)=>{
    try {
        const {otp,email}=req.body
        let OTP=parseInt(otp)
        if(!email || !OTP){
            res.status(400).send("OTP is required")
        }
        //check
        const user=await userModel.findOne({email});
        // validation
        if(!user){
            return res.status(404).send({
                success:false,
                message:"You have Enter wrong Email"
            })
        }
        console.log(user.otp)
        console.log(OTP)
        if(user.otp===OTP){
            return res.status(200).send({
                success:true,
                message:"OTP Accepted Successfully"
            });
        }
        res.status(200).send({
            success:false,
            message:"OTP Is Not Matched"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Something went wrong otp verify!"});
    }
}
//RESET PASSWORD HERE
export const resetPasswordController= async(req,res)=>{
    const {email,password}=req.body
    try {
        if(!email || !password){
            res.status(400).send("Email is required")
        }
       
        const user=await userModel.findOne({email});
      
        if(!user){
            return res.status(404).send({
                success:false,
                message:"Wrong email and Answer"
            })
        }
        const newHashed= await hashPassword(password);
        await userModel.findByIdAndUpdate(user._id,{password:newHashed});
        res.status(200).send({
            success:true,
            message:"Password Reset Successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Something went wrong forget password!"});
    }
}

// UPDATE FROFILE CONTROLLER
export const profileUpdateController=async(req,res)=>{
    const formData=req.body
    try {
        const {_id,firstName,lastName,email,phone,city,country,state,pincode,address1,address}=formData;
        const user=await userModel.findById(_id);
        const userData=await userModel.findByIdAndUpdate(_id,{
            firstname:firstName || user.firstname,
            lastname:lastName || user.lastname,
            phone:phone ||user.phone,
            orderemail:email ||user.email,
            city:city,
            state:state,
            pincode:pincode,
            country:country,
            address1:address1,
            address: address ||user.address
        },{new:true})
        const updatedUser={
            _id:userData._id,
            firstname:userData.firstname,
            lastname:userData.lastname,
            email:userData.email,
            phone:userData.phone,
            address:userData.address,
            role:userData.role
        }
        res.status(200).send({success:true,message:"user updated successfully",updatedUser});
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Something went wrong update profile!"});
    }
}

//GET USER ORDERS CONTROLLER
export const userOrdersController=async(req,res)=>{
    const {uid}=req.params
    try {
    const orders=await orderModel.find({buyer:uid})
    res.json({success:true,orders});
    } catch (error) {
        console.log(error);
        return res.status(500).send({success:false,message:"Something went wrong while get user orders"});
    }
}

//GET ALL OREDERS
export const getAllOrdersController=async(req,res)=>{
    try {
        const orders=await orderModel.find({}).populate("buyer").sort({createdAt:"-1"});
        res.json({success:true,orders});
    } catch (error) {
        console.log(error);
        return res.status(500).send({success:false,message:"Something went wrong while All Orders in admin"});
    }
} 


//ORDER STATUS CONTROLLER
export const orderStatusController=async(req,res)=>{
    try {    
    const {value}=req.body
    const status=value;
    const {orderId}=req.params
    const orders=await orderModel.findByIdAndUpdate(orderId,{status},{new:true});
    res.json(orders);
    } catch (error) {
    console.log(error);
    return res.status(500).send({success:false,message:"Something went wrong while order status update"});   
}

}
//ORDER DETAILS CONTROLLER
export const orderDetailsController=async(req,res)=>{
    try {    
    const {orderId}=req.params
    const order=await orderModel.findOne({_id:orderId}).populate("buyer");
    res.json({success:true,order});
    } catch (error) {
    console.log(error);
    return res.status(500).send({success:false,message:"Something went wrong while order details fetching"});   
}
}
// testing purpose
export const testingController=(req,res)=>{
    res.send("protected routes");
}