import slider1Model from '../models/slider1Model.js'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import slugify from "slugify";
// CREATE SLIDER CONTROLLER
export const createSlideController = async (req, res) => {
  try {
    const {name}=req.body;
    const url= req.file.filename;

    const slide=new slider1Model({title:name,slug:slugify(name),url});
   
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

//GET PHOTO OF SLIDER CONTROLLER
export const getSlidePhotoController=async(req,res)=>{
  try {
      const slide=await slider1Model.findById(req.params.sid).select("slidephoto");
      if(slide.slidephoto.data){
          res.set("Content-type",slide.slidephoto.contentType);
          return res.status(200).send(slide.slidephoto.data);
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

// Update slider entry by ID
export const updateSlideController = async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.fields;
      const { slidephoto } = req.files;
  
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
  
      // Find the slider entry by ID
      const slider = await slider1Model.findById(id);
  
      if (!slider) {
        return res.status(404).json({ error: 'Slider entry not found' });
      }
  
      // Update the slider data
      slider.title = title;
  
      if (slidephoto) {
        slider.slidephoto.data = fs.readFileSync(slidephoto.path);
        slider.slidephoto.contentType = slidephoto.type;
      }
  
      // Save the updated slider
      await slider.save();
  
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
        const filePath = path.join(__dirname, '..', 'routes', 'public', 'Images',`${deleteSlide.url}`);
        if (deleteSlide) {
          fs.unlinkSync(filePath);
        res.json({
          success: true,
          message: 'Slider entry deleted successfully',
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };