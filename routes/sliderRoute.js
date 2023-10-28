import express from 'express'
import { createSlideController, deleteSlideController, getAllSlidesController, getSlidePhotoController, updateSlideController } from '../controllers/createSlideController.js';
import formidable from "express-formidable";//USE FOR PHOTO UPLOAD
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import multer from "multer";
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

const router=express.Router();

router.post('/create-slide',upload.single('image'),requireSignIn,isAdmin,createSlideController);

router.get('/get-all-slide',getAllSlidesController);
router.get('/get-slide-photo/:sid',getSlidePhotoController);

router.post('/update-slide',requireSignIn,isAdmin,formidable(),updateSlideController);

router.delete('/delete-slide/:sid',requireSignIn,isAdmin,deleteSlideController);

export default router;