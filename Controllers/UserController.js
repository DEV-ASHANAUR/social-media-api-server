import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import {createError} from '../utils/error.js';

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
    const {currentUserId, currentAdminStatus, password} = req.body;

    if(id === currentUserId || currentAdminStatus){
        try {
            if(password){
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(password,salt);
            }

            const user = await UserModel.findByIdAndUpdate(id,req.body,{
                new:true
            });

            res.status(200).json(user);

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
    const id = req.params.id;
    const {currentUserId} = req.body;

    if(id === currentUserId){
        return next(createError(403,"Action Forbidden"));
    }else{
        try {
            const followUser = await UserModel.findById(id);
            const followingUser = await UserModel.findById(currentUserId);

            if(!followUser.followers.includes(currentUserId)){
                await followUser.updateOne({$push:{followers:currentUserId}});
                await followingUser.updateOne({$push:{following:id}});
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
    const {currentUserId} = req.body;

    if(id === currentUserId){
        return next(createError(403,"Action Forbidden"));
    }else{
        try {
            const followUser = await UserModel.findById(id);
            const followingUser = await UserModel.findById(currentUserId);

            if(followUser.followers.includes(currentUserId)){
                await followUser.updateOne({$pull:{followers:currentUserId}});
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