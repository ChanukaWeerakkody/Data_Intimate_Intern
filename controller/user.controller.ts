import * as path from "path";

require('dotenv').config();
import {Response,Request,NextFunction} from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../util/ErrorHandler";
import {CatchAsyncError} from "../middleware/catchAsyncErrors";
import * as jwt from "jsonwebtoken";
import {Secret} from "jsonwebtoken";
import * as ejs from "ejs";
import sendMail from "../util/sendMail";

//Register a new user
interface IRegisterBody{
    name:string;
    email:string;
    password:string;
    avatar?:string;
}

//Register user
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

        try{
            await sendMail({
                email:user.email,
                subject:"Activate your account",
                template:"activation-mail.ejs",
                data
            });

            res.status(201).json({
                success:true,
                message:`Account created successfully, please check ${user.email} to activate your account`,
                activationToken:activationToken.token,
            });

        }catch (error:any){
            return next(new ErrorHandler(error.message,400));
        }

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