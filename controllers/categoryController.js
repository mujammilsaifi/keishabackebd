import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cloudinary from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.ClOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret:  process.env.API_SECRET 
});
// CREATE CATEGORY CONTROLLER
export const createCategoryController= async (req,res)=>{
    try {
        const {name}=req.body;
        
        if(!name){
            return res.status(401).send({message:"Name is Required"});
        }
        const exisitingCategory= await categoryModel.findOne({name});
        if(exisitingCategory){
            return res.status(200).send({
                success:false,
                message:"Category Already Exisits"
            })
        }
        const result=await cloudinary.v2.uploader.upload(req.file.path);
        const url= result.secure_url
        const publicid=result.public_id
        const filePath = path.join(__dirname, '..', 'routes', 'public', 'Images',`${req.file.filename}`);
        fs.unlinkSync(filePath);
        const category=new categoryModel({name,slug:slugify(name),url,publicid});
        await category.save();
        res.status(201).send({
            success:true,
            message:"New Category Created Successfully",
            category
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"error in category"
        })
    }
};

//GET PHOTO OF CATEGORY CONTROLLER
export const getCategoryPhotoController=async(req,res)=>{
    try {
        const category=await categoryModel.findById(req.params.cid).select("catphoto");
        if(category.catphoto.data){
            res.set("Content-type",category.catphoto.contentType);
            return res.status(200).send(category.catphoto.data);
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in Geting Photo of Category" 
        })
    }
}
// UPDATE CATEGORY CONTROLLER 
export const updateCategoryController= async (req,res)=>{
    try {
       
        const {name}=req.body;
        const url= req.file.filename;
        const exisitingCategory= await categoryModel.findById(req.params.cid);
        if(exisitingCategory){
            const filePath = path.join(__dirname, '..', 'routes', 'public', 'Images',`${exisitingCategory.url}`);
            fs.unlinkSync(filePath);
        }
        const category=await categoryModel.findByIdAndUpdate(req.params.cid,{name,slug:slugify(name),url},{new:true}); 
        await category.save();
        res.status(201).send({
            success:true,
            message:"Category updated Successfully",
            category
        })  
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error, While in category Updating"
        })
    }
}

//GET ALL CATEGORY CONTROLLER
export const allCategoryController= async (req,res)=>{
    try {
        const category=await categoryModel.find({});
        res.status(201).send({
            success:true,
            message:"All Category Feched Successfully",
            category
        }) 
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error, Get All Category "
        })
    }
}
//GET SINGLE CATEGORY
export const singleCategorycontroller=async (req,res)=>{
    try {
        const category= await categoryModel.findOne({slug:req.params.slug});
        res.status(201).send({
            success:true,
            message:"Get Single Category Successfully",
            category
        }) 
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error, Get Single Category "
        })
        
    }
}

//DELETE CATEGORY CONTROLLER
export const deleteCategoryController=async (req,res)=>{
    try {
        const { id } = req.params; 
      
        // Delete the category by id
        const deletedCategory = await categoryModel.findByIdAndDelete(id);
      
        if (deletedCategory) {
            const public_id=deletedCategory.publicid
            await cloudinary.v2.uploader.destroy(public_id);
          res.status(201).send({
            success: true,
            message: "Delete Category Successfully",
          });
        } else {
          res.status(404).send({
            success: false,
            message: "Category not found or already deleted.",
          });
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send({
          success: false,
          message: "Error deleting category",
        });
      }
}
      