"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var user_controller_1 = require("../controller/user.controller");
var userRouter = express.Router();
userRouter.post("/registration", user_controller_1.registrationUser);
userRouter.post("/activate-user", user_controller_1.activateUser);
exports.default = userRouter;
