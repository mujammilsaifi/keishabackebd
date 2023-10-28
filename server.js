import express from 'express'
import colors from 'colors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/MongoDB.js'
import categoryRoutes from './routes/categoryRoute.js'
import authRoutes from './routes/authRoute.js';
import productRoutes from './routes/productRoute.js';
import sliderRoutes from './routes/sliderRoute.js';
import cors from 'cors'
import bodyParser from 'body-parser'

// configure dotenv 
dotenv.config()

//rest object
const app=express();

//Database config
connectDB()


//middleware
app.use(cors());
app.use(express.json())
app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('routes/public'))
//routes
app.use('/api/v1/slider',sliderRoutes);
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/product',productRoutes);
app.use('/api/v1/category',categoryRoutes);



//rest api
app.get("/",(req,res)=>{
    res.send("<h1> Welcome to Kesha Jewellery</h1>")
})


//PORT
const PORT=process.env.PORT ||8080;

app.listen(PORT,()=>{
    console.log(`Running Server On Port ${PORT}`.bgCyan.white)
})