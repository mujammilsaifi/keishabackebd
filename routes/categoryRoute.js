import  express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { allCategoryController, createCategoryController, deleteCategoryController, singleCategorycontroller, updateCategoryController ,getCategoryPhotoController} from "../controllers/categoryController.js";

const router=express.Router();
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

//CREATE CATEGORY
router.post('/create-category',upload.single('image'),requireSignIn,isAdmin,createCategoryController);

//GET PHOTO OF PRODUCTS
router.get('/category-photo/:cid',getCategoryPhotoController);

//UPDATE CATEGORY
router.put('/update-category/:cid',upload.single('image'),requireSignIn,isAdmin,updateCategoryController);

//GET ALL CATEGORY
router.get('/get-category',allCategoryController);

//GET SINGLE CATEGORY
router.get('/single-category/:slug',singleCategorycontroller);

// DELETE CATEGORY
router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryController);
export default router