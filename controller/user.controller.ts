import {Response,Request,NextFunction} from "express";
import userModel,{IUser} from "../models/user.model";
import ErrorHandler from "../util/ErrorHandler";
import {CatchAsyncError} from "../middleware/catchAsyncErrors";

//Register a new user
interface IRegisterUser{
    name:string;
    email:string;
    password:string;
    avatar?:string;
}