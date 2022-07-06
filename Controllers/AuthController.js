import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import {createError} from '../utils/error.js';

//Reg user
export const registerUser = async(req,res,next)=>{
    const {username,password,firstname,lastname} = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password,salt);

    const newUser = new UserModel({
        username,
        password:hashedPass,
        firstname,
        lastname
    });

    try {
        await newUser.save();
        res.status(200).json(newUser);
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
            if(validity){
                res.status(200).json(user)
            }else{
                return next(createError(400,"Wrong password or username"))
            }
        }else{
            return next(createError(400,"user does not exists"));
        }
    } catch (error) {
        next(error);
    }
}