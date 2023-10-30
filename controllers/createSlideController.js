import slider1Model from '../models/slider1Model.js'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import slugify from "slugify";

import  cloudinary from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'dfa8inc1d', 
  api_key: '241994482794814', 
  api_secret: '57YXsYJP_CRvKN_lOXbhWyAQBX0' 
});
          

// CREATE SLIDER CONTROLLER
export const createSlideController = async (req, res) => {
  try {
    const {name}=req.body;
    const result=await cloudinary.v2.uploader.upload(req.file.path);
    const url= result.secure_url
    const publicid=result.public_id
    const slide=new slider1Model({title:name,slug:slugify(name),url,publicid});
    const filePath = path.join(__dirname, '..', 'routes', 'public', 'Images',`${req.file.filename}`);
    fs.unlinkSync(filePath);
    await slide.save();
    res.status(201).send({
        success:true,
        message:"New Slide Created Successfully",
        slide
    })
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
};

//GET ALL SLIDER CONTROLLER
export const getAllSlidesController = async (req, res) => {
    try {
      const sliders = await slider1Model.find();
      res.status(201).send({
        success:true,
        message:"All Slide Fetched Successfully",
        sliders
    }) 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
};



// Update slider entry by ID
export const updateSlideController = async (req, res) => {
      const { _id } = req.params;
      const {name}=req.body;
    try {
      
      const result=await cloudinary.v2.uploader.upload(req.file.path);
      const url= result.secure_url
      const publicid=result.public_id
      
      const filePath = path.join(__dirname, '..', 'routes', 'public', 'Images',`${req.file.filename}`);
      fs.unlinkSync(filePath);
   
      // Find the slider entry by ID
      const slider = await slider1Model.findById(id);
      if (!slider) {
        return res.status(404).json({ error: 'Slider entry not found' });
      }
      await cloudinary.v2.uploader.destroy(slider.publicid);
      const slide=await slider1Model.findByIdAndUpdate(_id,{title:name,slug:slugify(name),url,publicid},{new:true});
      await slide.save();
      res.json({
        success: true,
        message: 'Slider entry updated successfully',
        updatedSlider: slider,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Delete slider entry by ID
export const deleteSlideController = async (req, res) => {
    try {

      // Find the slider entry by ID
        const {sid}=req.params
        const deleteSlide=await slider1Model.findByIdAndDelete(sid);
        const public_id=deleteSlide.publicid
        await cloudinary.v2.uploader.destroy(public_id);
        res.json({
          success: true,
          message: 'Slider entry deleted successfully',
        });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
};