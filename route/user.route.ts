import * as express from "express";
import {
    activateUser,
    deleteUser,
    getAllUsers,
    loginUser,
    logoutUser,
    registrationUser, updateUser, updateUserInfo
} from "../controller/user.controller";
const userRouter = express.Router();

userRouter.post("/registration",registrationUser);
userRouter.post("/activate-user",activateUser);
userRouter.post("/login",loginUser);
userRouter.post("/logout",logoutUser);
userRouter.get("/getAll-users",getAllUsers);
userRouter.delete("/delete-user/:id",deleteUser);
userRouter.put("/updateUser/:id",updateUser);

export default userRouter;