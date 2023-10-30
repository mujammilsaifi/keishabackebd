import slugify from "slugify";
import productModel from "../models/productModel.js";
import fs from 'fs'
import categoryModel from "../models/categoryModel.js";
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto'
import axios from "axios";
import orderModel from "../models/orderModel.js";
// Define your merchant details
const saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const saltIndex = 1;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cloudinary from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.ClOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret:  process.env.API_SECRET 
});

//CREATE PRODUCT CONTROLLER
export const createProductController=async (req,res)=>{
    try {
        const { name, description, price,sprice,setting,material,length,width,weight, tag, gemstone, color, category } = req.body;
        const images=[]
        for (const file of req.files) {
              const result = await cloudinary.v2.uploader.upload(file.path);
              images.push({
                url: result.secure_url,
                publicid: result.public_id,
            });
        }
        for (const file of req.files) {
            const filePath = path.join(__dirname, '..', 'routes', 'public', 'Images',`${file.filename}`);
            fs.unlinkSync(filePath);
        }
        
        
        // Create a new product using the schema
        const product = new productModel({
          name,
          description,
          slug:slugify(name),
          price,
          sprice,
          length,width,
          weight,
          setting,
          material,
          tag,
          gemstone,
          color,
          category,
          images, // Set the images property with the array of image objects
        });
        
        // Save the product to the database
        await product.save();
        
        return res.status(201).json({
          success: true,
          product,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error,
          message: 'Error in creating a product',
        });
      }
};

//GET ALL PRODUCT CONTROLLER
export const getProductController=async(req,res)=>{
    try {
            const products = await productModel.find({}).populate("category").sort({ createdAt: -1 });
            res.status(201).send({
            success: true,
            totalProduct: products.length,
            message: "All products fetched successfully",
            products,
            });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in Geting Products" 
        })
    }
}

//GET SINGLE PRODUCT CONTROLLER
export const getSingleProductController=async(req,res)=>{
    try {
        const product = await productModel
        .findOne({ slug: req.params.slug })
        .populate("category");
        res.status(200).send({
            success:true,
            message:"Product fetched Successfully!",
            product,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in Geting Single  Product" 
        })
    }
}

//GET PHOTO OF PRODUCT CONTROLLER
export const getProductPhotoController=async(req,res)=>{
    try {
        const product=await productModel.findById(req.params.pid).select("photo");
        if(product.photo.data){
            res.set("Content-type",product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    }catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in Geting Photo of Product" 
        })
    }
}


//DELETE PRODUCT CONTROLLER
export const deleteProductController= async(req,res)=>{
    try {
        const deletedproduct=await productModel.findByIdAndDelete(req.params.pid);
        for (const img of deletedproduct?.images) {
            const public_id=img.publicid
        await cloudinary.v2.uploader.destroy(public_id);
      }

        res.status(200).send({
            success:true,
            message:"Product Deleted Successfully",            
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error while product deleting" 
        })
    }
}

//UPDATE PRODUCT CONTROLLER
export const updateProductController=async (req,res)=>{
    try {
        const { name, description, price,sprice,material,setting,length,width,weight, tag, gemstone, color, category } = req.body;
        // Create an array to store image objects
        const images = req.files.map((file) => ({
          url: file.filename, // You may need to adjust this based on your upload settings
        }));
        
        const updateProduct=await productModel.findById(req.params.pid);
        updateProduct?.images.map((img,i)=>{
             const filePath = path.join(__dirname, '..', 'routes', 'public', 'Images',`${img.url}`);
             if(filePath){
                fs.unlinkSync(filePath);
             }
         })
        const products=await productModel.findByIdAndUpdate(req.params.pid,{
            name,
            description,
            slug:slugify(name),
            price,
            sprice,
            length,width,
            weight,
            setting,
            material,
            tag,
            gemstone,
            color,
            category,
            images, 
            },{new:true});
       
        await products.save();
        res.status(200).send({
            success:true,
            message:"Product Updated SuccessFully",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in updating Product" 
        })
    }
};

//PRODUCT FILTER CONTROLLER
export const productFilterController=async (req,res)=>{
    try {
        const {checked,radio}=req.body;
        let args={};
        if(checked.length>0) args.category=checked;
        if(radio.length) args.price={$gte:radio[0],$lte:radio[1] };
        const products=await productModel.find(args);
        res.status(200).send({
            success:true,
            message:"Product Filtered SuccessFully",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Filtering Product" 
        })
    }
}

//PORDUCT COUNT CONTROLLER
export const productCountController= async(req,res)=>{
    try {
        const total=await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success:true,
            message:"Product Counted SuccessFully",
           total
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in count Product" 
        })
    }
}

//PRODUCT LIST PER PAGE CONROLLER
export const productListController= async(req,res)=>{
    try {
    let perPage=3;
    const page=req.params.page?req.params.page:1;
    const products=await productModel.find({}).select("-photo").skip((page-1)*perPage).limit(perPage).sort({createdAt:-1});
    res.status(200).send({
        success:true,
        message:"Product Listed SuccessFully",
        products
    });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in List Product" 
        })   
    }
}

//SEARCH PRODUCT CONTROLLER
export const searchProductController=async(req,res)=>{
    try {
        const {keyword}=req.params
        const results=await productModel.find({
            $or:[
                {name:{$regex:keyword,$options:"i"}},
                {description:{$regex:keyword,$options:"i"}}
            ]
        })
        res.json(results);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Search Product" 
        })   
    }
    
}

//RELATED PRODUCT CONTROLLER
export const  relatedProductController= async(req,res)=>{
    try {
       const {pid,cid}=req.params;
       const products=await productModel.find({
        category:cid,_id:{$ne:pid}
       }).limit(4).populate("category")
       res.status(200).send({
        success:true,
        message:"related product successfully",
        products
       })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Related Product" 
        })   
    }
}

//GET PRODUCT BY CATEGORY
export const getProductByCategoryController=async(req,res)=>{
    try {
        const category=await categoryModel.findOne({slug:req.params.slug});
        const products=await productModel.find({category});
        res.status(200).send({
            success:true,
            totalProduct: products.length,
            message:"products by category successfully",
            products
           })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error, while geting product by category" 
        })   
    }
}

export const paymentController=async(req,res)=>{
        const payload = req.body;          
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
                  
        const checksum = crypto
                .createHash('sha256')
                .update(base64Payload + "/pg/v1/pay" + saltKey)
                .digest('hex') + '###' + saltIndex;
            try {
                            
                const options = {
                  method: 'POST',
                  url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
                  headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                  },
                  data: {
                    request: base64Payload,
                  },
                };
                
                const response = await axios.request(options);
                // console.log(response);
                res.status(200).json(response.data);
              } catch (error) {
                res.status(500).json({ error: error.message });
              }        
   
}
export const CheckpaymentController=async(req,res)=>{
    const {merchantId,merchantTransactionId} = req.body;          
                 
        const path = '/pg/v1/status/' + merchantId + '/' + merchantTransactionId;
        const inputString = path + saltKey;
        const hash = crypto.createHash('sha256').update(inputString).digest('hex');
        const checkSum = hash + '###' + saltIndex;
        
        try {
                        
             const options = {
              method: 'GET',
              url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
              headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checkSum,
                'X-MERCHANT-ID': 'MT7850590068188104'
              }
            };
            
            const response = await axios.request(options);
            // console.log(response?.data)
            res.status(200).json(response.data);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }        

}

export const placeOrderController=async(req,res)=>{
    const {userId,products,paymentMethod} = req.body;          
        
        try {
            products.map((p)=>{
                const order=new orderModel({
                    product:p,
                    payment:paymentMethod,
                    buyer:userId,
                }).save()
               
            })
            res.json({success:true});
          } catch (error) {
            res.status(500).json({ error: error.message });
          }        

}
