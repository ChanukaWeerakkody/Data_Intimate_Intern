import path from "path";

require('dotenv').config();
import {Response,Request,NextFunction} from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../util/ErrorHandler";
import {CatchAsyncError} from "../middleware/catchAsyncErrors";
import jwt,{Secret} from "jsonwebtoken";
import * as ejs from "ejs";

//Register a new user
interface IRegisterBody{
    name:string;
    email:string;
    password:string;
    avatar?:string;
}

export const registrationUser = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const {name,email,password} = req.body;

        const isEmailExists = await userModel.findOne({email});
        if(isEmailExists){
            return next(new ErrorHandler("Email already exists",400));
        }

        const user:IRegisterBody = {
            name,
            email,
            password,
        };

        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data ={user:{name:user.name},activationCode};
        const html = ejs.renderFile(path.join(__dirname,"../mails/activation-mail.ejs"),data);

    }catch (error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

interface IActivationToken{
    token:string;
    activationCode:string;
}

export const createActivationToken = (user:any)=>{
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({
            user,activationCode
        },process.env.ACTIVATION_SECRET as Secret,{
            expiresIn:"5m"
        });
    return{token,activationCode};
}