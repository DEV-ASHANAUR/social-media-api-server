import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js";
import { createError } from "../utils/error.js";

//create new post
export const createPost = async(req,res,next)=>{
    const newPost = new PostModel(req.body);

    try {
        await newPost.save();
        res.status(200).json(newPost);
    } catch (error) {
        next(error);
    }
}

//get post by post id
export const getPost = async(req,res,next)=>{
    const id = req.params.id;

    try {
        const post = await PostModel.findById(id);
        res.status(200).json(post);

    } catch (error) {
        next(error);
    }
}
//update post
export const updatePost = async(req,res,next)=>{
    const postId = req.params.id;
    const {userId} = req.body;

    try {
        const post = await PostModel.findById(postId);
        if(userId === post.userId){
            await post.updateOne({$set:req.body});
            res.status(200).json("post updated");
        }else{
            return next(createError(403,"Action Forbidden"));
        }
    } catch (error) {
        next(error);
    }
}
//delete post
export const deletePost = async(req,res,next)=>{
    const postId = req.params.id;
    const {userId} = req.body;

    try {
        const post = await PostModel.findById(postId);
        if(userId === post.userId){
            await post.deleteOne();
            res.status(200).json("Post deleted successfully");
        }else{
            return next(createError(403,"Action Forbidden"));
        }
    } catch (error) {
        next(error);
    }
}

//like dislike a post
export const likePost = async(req,res,next)=>{
    const id = req.params.id;
    const {userId} = req.body;

    try {
        const post = await PostModel.findById(id);
        if(!post.likes.includes(userId)){
            await post.updateOne({$push:{likes: userId}});
            res.status(200).json("Post Liked!");
        }else{
            await post.updateOne({$pull:{likes: userId}});
            res.status(200).json("Post UnLiked!");
        }
    } catch (error) {
        next(error);
    }
}