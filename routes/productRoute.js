import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { CheckpaymentController, createProductController, deleteProductController, getProductByCategoryController, getProductController, getProductPhotoController, getSingleProductController, paymentController, placeOrderController, productCountController, productFilterController, productListController, relatedProductController, searchProductController, updateProductController } from "../controllers/productController.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import multer from "multer";
const router=express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const destinationPath = path.join(__dirname, 'public', 'Images');
      cb(null, destinationPath)
    },
    filename: function (req, file, cb) {
      return cb(null, `${Date.now()}_${file.originalname}`)
    }
  })
  
  const upload = multer({ storage: storage })

//CREATE PRODUCT
router.post('/create-product',upload.array('images', 5),requireSignIn,isAdmin,createProductController);

//GET ALL PRODUCTS
router.get('/get-product',getProductController);

//GET SINGLE PRODUCTS
router.get('/get-product/:slug',getSingleProductController);

//GET PHOTO OF PRODUCTS
router.get('/product-photo/:pid',getProductPhotoController);


//DELETE PRODUCT
router.delete('/delete-product/:pid',deleteProductController);

//UPDATE PRODUCT
router.put('/update-product/:pid',upload.array('images', 5),requireSignIn,isAdmin,updateProductController);

//PRODUCT FILTER
router.post('/product-filter',productFilterController);

//PRODUCT COUNT
router.get('/product-count',productCountController);

//PRODUCT LIST
router.get('/product-list/:page',productListController);

//PRODUCT LIST
router.get('/search/:keyword',searchProductController);

//RELATED PRODUCT 
router.get('/related-product/:pid/:cid',relatedProductController);

//GET PRODUCT BY CATEGORY
router.get("/product-by-category/:slug",getProductByCategoryController);

//Payment PhonePe
router.post("/initiatePayment",paymentController);
//Check Payment PhonePe
router.post("/checkPayment",CheckpaymentController);

//Check Payment PhonePe
router.post("/order",placeOrderController);


export default router;