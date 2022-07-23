import MessageModel from "../Models/messageModel.js";

export const addMessage = async(req,res,next)=>{
    // const {chatId,senderId,text,image} = req.body;
    // console.log(req.body);
    const message = new MessageModel(req.body);
    try {
        const result = await message.save();
        res.status(200).json(result)
    } catch (error) {
        next(error);
    }
}

export const getMessage = async(req,res,next)=>{
    const {chatId} = req.params;
    try {
        const result = await MessageModel.find({chatId});
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}