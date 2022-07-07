import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import {createError} from '../utils/error.js';
import jwt from 'jsonwebtoken';
//Reg user
export const registerUser = async(req,res,next)=>{
    
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password,salt);

    req.body.password = hashedPass;

    const newUser = new UserModel(req.body);

    const {username} = req.body;

    try {
        // check the user is already have or not
        const oldUser = await UserModel.findOne({username})
        if(oldUser){
            return next(createError(400,"User already exists"));
        }
        const user = await newUser.save();
        const token = jwt.sign(
            {username:user.username, id:user._id},
            process.env.JWTKEY,{expiresIn:"1d"}
        )
        res.status(200).json({user,token});
    } catch (error) {
        next(error);
    }
}
//login 
export const loginUser = async(req,res,next)=>{
    const  {username,password} = req.body;

    try {
        const user = await UserModel.findOne({username:username});
        if(user){
            const validity = await bcrypt.compare(password,user.password)
            if(!validity){
                return next(createError(400,"Wrong password or username"))
            }else{
                const token = jwt.sign(
                    {username:user.username, id:user._id},
                    process.env.JWTKEY,{expiresIn:"1d"}
                )
                res.status(200).json({user,token})
            }
        }else{
            return next(createError(400,"user does not exists"));
        }
    } catch (error) {
        next(error);
    }
}