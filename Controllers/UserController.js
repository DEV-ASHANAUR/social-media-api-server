import UserModel from "../Models/userModel.js";
import ChatModel from "../Models/chatModel.js";
import bcrypt from 'bcrypt';
import {createError} from '../utils/error.js';
import jwt from 'jsonwebtoken';

//getAllUser
export const getAllUser = async(req,res,next)=>{
    try {
        let users = await UserModel.find();
        users = users.map((user)=>{
            const {password, ...otherDetails} = user._doc;
            return otherDetails;
        })
        res.status(200).json(users); 
    } catch (error) {
        next(error)
    }
}

//get user
export const getUser = async(req,res,next)=>{
    const id = req.params.id;

    try {
        const user = await UserModel.findById(id);
        if(user){
            const {password, ...otherDetails} = user._doc;

            res.status(200).json(otherDetails);
        }else{
            return next(createError(404,"No such user exists"));
        }
    } catch (error) {
        next(error);
    }
}
//update user
export const updateUser = async(req,res,next)=>{
    const id = req.params.id;
    const {_id, password} = req.body;
    // console.log("id",_id);
    if(id === _id){
        try {
            if(password){
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(password,salt);
            }

            const user = await UserModel.findByIdAndUpdate(id,req.body,{
                new:true
            });
            const token = jwt.sign(
                {username:user.username, id:user._id},
                process.env.JWTKEY,{expiresIn:"1d"}
            )
            // console.log({user, token})
            res.status(200).json({user,token})
        } catch (error) {
            next(error);
        }
    }else{
        return next(createError(403,"Access Denied! you can only update your own profile"));
    }
}
//delete user
export const deleteUser = async(req,res,next)=>{
    const id = req.params.id;
    const {currentUserId, currentAdminStatus} = req.body;
    if(id === currentUserId || currentAdminStatus){
        try {
            await UserModel.findByIdAndDelete(id);
            res.status(200).json("User Deleted SuccessFully");
        } catch (error) {
            next(error);
        }
    }else{
        return next(createError(403,"Access Denied! you can only delete your own profile"));
    }
}
//follow User
export const followUser = async(req,res,next)=>{
    //target user id for follow catch by param
    const id = req.params.id;
    //current user id
    const {_id} = req.body;

    if(id === _id){
        return next(createError(403,"Action Forbidden"));
    }else{
        const newChat = new ChatModel({
            members: [_id, id],
        });
        try {
            const followUser = await UserModel.findById(id);
            const followingUser = await UserModel.findById(_id);

            if(!followUser.followers.includes(_id)){
                await followUser.updateOne({$push:{followers:_id}});
                await followingUser.updateOne({$push:{following:id}});
                const chat = await ChatModel.findOne({
                    members: { $all: [_id, id] },
                });
                if(!chat){
                    await newChat.save();
                }
                res.status(200).json("User followed!");
            }else{
                return next(createError(403,"User is Already followed by you"));
            }
        } catch (error) {
            next(error);
        }
    }
}
//follow User
export const UnFollowUser = async(req,res,next)=>{
    const id = req.params.id;
    const {_id} = req.body;

    if(id === _id){
        return next(createError(403,"Action Forbidden"));
    }else{
        try {
            const followUser = await UserModel.findById(id);
            const followingUser = await UserModel.findById(_id);

            if(followUser.followers.includes(_id)){
                await followUser.updateOne({$pull:{followers:_id}});
                await followingUser.updateOne({$pull:{following:id}});
                res.status(200).json("User Unfollowed!");
            }else{
                return next(createError(403,"User is not followed by you"));
            }
        } catch (error) {
            next(error);
        }
    }
}