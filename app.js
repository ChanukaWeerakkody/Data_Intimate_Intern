"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var cookieParser = require("cookie-parser");
require('dotenv').config();
var express = require("express");
exports.app = express();
var cors = require("cors");
var error_1 = require("./middleware/error");
//body parser
exports.app.use(express.json({ limit: "50mb" }));
//cookie-parser
exports.app.use(cookieParser());
//cors => cross origin resource sharing
exports.app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
//Routes
//app.use('/api/v1', userRouter);
//testing api
exports.app.get("/test", function (req, res, next) {
    res.status(200).json({
        success: true,
        message: "Test route successful",
    });
});
//unknown route
exports.app.all("*", function (req, res, next) {
    var err = new Error("Route ".concat(req.originalUrl, " not found"));
    err.statusCode = 404;
    next(err);
});
exports.app.use(error_1.ErrorMiddleware);
