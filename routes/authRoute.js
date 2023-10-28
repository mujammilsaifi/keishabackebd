import  express  from "express";
import {registerController,loginController, profileUpdateController, userOrdersController, getAllOrdersController, orderStatusController, orderDetailsController, sendOTPController, varifyOTPController, resetPasswordController} from "../controllers/authController.js"
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import couponModel from "../models/couponModel.js";

//routes object
const router=express.Router()

//REGISTER | METHOD POST
router.post('/register',registerController);

//LOGIN  | METHOD POST
router.post('/login',loginController);
//FORGET PASSWORD  | METHOD POST
router.post('/send-otp',sendOTPController);
router.post('/verify-otp',varifyOTPController);
router.post('/reset-password',resetPasswordController);

//UPDATE USER PROFILE
router.put('/profile',requireSignIn,profileUpdateController);

//GET USER ORDERS
router.get("/orders/:uid",requireSignIn,userOrdersController);

//GET ALL ORDERS
router.get("/orders",getAllOrdersController);

//ORDER STATUS SET
router.put("/order-status/:orderId",orderStatusController);

//ORDER STATUS SET
router.get("/order-details/:orderId",orderDetailsController);

//PROTECTED ROUTE FOR USER
router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
});

//PROTECTED ROUTE FOR ADMIN
router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true});
});

//COUPON ROUTE FOR ADMIN
router.post('/coupon', async (req, res) => {
    try {
        const { couponcode,coupondiscount,coupondate} = req.body;
        const coupon = new couponModel({ title:couponcode, discount:coupondiscount, date:coupondate });
        await coupon.save();

        res.status(201).send({success:true,coupon});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get All coupon for admin
router.get('/coupons', async (req, res) => {
        
    try {
        const coupons = await couponModel.find({});        
        return res.send( {success:true,coupons});        
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get coupon 
router.get('/coupon/:title', async (req, res) => {
    const {title}=req.params
    
    try {
        const coupon = await couponModel.find({title});
        if(coupon.length!==0){
            return res.send( {success:true,coupon});
        }else{
            return res.send( {success:false});
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get coupon 
router.delete('/coupon/:id', async (req, res) => {
   const couponId=req.params.id
    try {
        await couponModel.findByIdAndRemove(couponId);
          
        res.json({ success: true, message: 'Coupon deleted successfully' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router