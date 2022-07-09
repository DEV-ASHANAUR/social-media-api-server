import express from 'express'
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';
import UploadRoute from './Routes/UploadRoute.js';
import path from 'path';
const app = express();
dotenv.config();

const PORT = process.env.PORT || 8000;

//database connection

// mongoose.connect(process.env.MONGO_DB,{
//     useNewUrlParser:true,
//     useUnifiedTopology: true,
// }).then(()=>{
//     app.listen(PORT,()=>{
//         console.log(`Server Listening at ${PORT}`);
//     })
// }).catch((error)=>{
//     console.log(error)
// })

const connect = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log("connected to mongoDB");
    } catch (error) {
        throw error;
    }
}

mongoose.connection.on("disconnected",()=>{
    console.log("mongodb disconnected");
})

//middleware
app.use(cors());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());
// to serve images inside public folder
app.use(express.static(path.join('public')));
// app.use(express.static('public')); 
app.use('/images', express.static('images'));

//all routes
app.get("/",(req,res)=>{
    res.send("Welcome To Social Media Server!");
});
//auth
app.use('/auth',AuthRoute);
app.use('/user',UserRoute);
app.use('/post',PostRoute);
app.use('/upload',UploadRoute);

app.use((err,req,res,next)=>{
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went worng";
    return res.status(errorStatus).json({
        success: false,
        status:errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
})

//listen
app.listen(PORT,()=>{
    connect();
    console.log("Connected to Backent.");
});


