import userModel from "../models/user.model";
import { Response } from 'express';
import {redis} from "../util/redis";


//get all user
export const getAllUserService = async (res:Response)=>{
    const users = await userModel.find().sort({createdAt:-1});
    res.status(201).json({
        success:true,
        users
    });
}

