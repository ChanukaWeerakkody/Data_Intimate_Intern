import * as express from "express";
import {activateUser, getAllUsers, loginUser, logoutUser, registrationUser} from "../controller/user.controller";
const userRouter = express.Router();

userRouter.post("/registration",registrationUser);
userRouter.post("/activate-user",activateUser);
userRouter.post("/login",loginUser);
userRouter.post("/logout",logoutUser);
userRouter.get("/getAll-users",getAllUsers);

export default userRouter;