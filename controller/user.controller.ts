import * as path from "path";

require('dotenv').config();
import {Response,Request,NextFunction} from "express";
import userModel, {IUser} from "../models/user.model";
import ErrorHandler from "../util/ErrorHandler";
import {CatchAsyncError} from "../middleware/catchAsyncErrors";
import * as jwt from "jsonwebtoken";
import {Secret} from "jsonwebtoken";
import * as ejs from "ejs";
import sendMail from "../util/sendMail";
import {sendToken} from "../util/jwt";
import {getAllUserService} from "../services/user.service";
import {redis} from "../util/redis";



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

//Activate user account
interface IActivationRequest{
    activation_token:string;
    activation_code:string;
}

export const activateUser = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const {activation_token,activation_code} = req.body as IActivationRequest;

        const newUser: {user:IUser;activationCode:string} = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as Secret
        ) as {user:IUser;activationCode:string};

        if(newUser.activationCode !== activation_code){
            return next(new ErrorHandler("Invalid activation code",400));
        }
        const {name,email,password} = newUser.user;

        const existsUser = await userModel.findOne({email});

        if(existsUser){
            return next(new ErrorHandler("Email already exists",400));
        }

        const user = await userModel.create({
            name,email,password
        })

        res.status(201).json({
            success:true,
            message:"Account activated successfully"
        })

    }catch (error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

//Login user
interface ILoginRequest{
    email:string;
    password:string;
}

export const loginUser = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const {email,password} = req.body as ILoginRequest;

        if(!email || !password){
            return next(new ErrorHandler("Please enter email and password",400));
        }

        const user = await userModel.findOne({email}).select("+password");

        if(!user){
            return next(new ErrorHandler("Invalid email or password",400));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if(!isPasswordMatched){
            return next(new ErrorHandler("Invalid email or password",400));
        }

        sendToken(user,200,res);

    }catch (error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

//Logout user
export const logoutUser = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        res.cookie("access_token","",{maxAge:1});
        res.cookie("refresh_token","",{maxAge:1});

        res.status(200).json({
            success:true,
            message:"Logged out successfully"
        })

    }catch (error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

//get all users
export const getAllUsers = CatchAsyncError(async(req:any,res:Response,next:NextFunction)=>{
    try {
        getAllUserService(res);
    }catch (error:any){
        return next(new ErrorHandler(error.message,500));
    }
});

//delete user
export const deleteUser = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const id = req.params.id;
        console.log(id);
        const user = await userModel.findById(id);
        await user.deleteOne({id});
       // await redis.del(id);
        res.status(200).json({
            success:true,
            message:"User deleted successfully",
        })
    }catch (error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

interface IUpdateUserInfo{
    name?:string;
    email?:string;
}

export const updateUserInfo = CatchAsyncError(async(req:any,res:Response,next:NextFunction)=>{
    try {
        const userId = req.user?._id;
        const {name,email} = req.body as IUpdateUserInfo;
        const user = await userModel.findById(userId);

        if(email && user){
            const isEmailExist = await userModel.findOne({email});
            if(isEmailExist){
                return next(new ErrorHandler("Email already exists",400));
            }
            user.email = email;
        }
        if(name && user){
            user.name = name;
        }
        await user?.save();
        await redis.set(userId,JSON.stringify(user));

        res.status(201).json({
            success:true,
            user
        })
    }catch (error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

export const updateUser = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const data =req.body;
        //const thumbnail = data.thumbnail;

        /*if(thumbnail){
            await cloudinary.v2.uploader.destroy(data.thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail,{
                folder:"courses"
            })
            data.thumbnail = {
                public_id:myCloud.public_id,
                url:myCloud.secure_url
            }
        }*/

        const courseId=req.params.id;
        const course = await userModel.findByIdAndUpdate(courseId,{
                $set:data},
            {new:true
            })
        res.status(200).json({
            success:true,
            course
        })
    }catch (err:any){
        return next(new ErrorHandler(err.message,500));
    }
})




























