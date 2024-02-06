"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
require('dotenv').config();
var redis_1 = require("./redis");
//parse environment variables to integrates with fallback values
var accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
var refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);
//options for cookies
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
};
var sendToken = function (user, statusCode, res) {
    var accessToken = user.signAccessToken();
    var refreshToken = user.signRefreshToken();
    //upload session to redis
    redis_1.redis.set(user._id, JSON.stringify(user));
    //only set secure to true in production
    if (process.env.NODE_ENV === 'production') {
        exports.accessTokenOptions.secure = true;
    }
    res.cookie('access_Token', accessToken, exports.accessTokenOptions);
    res.cookie('refresh_Token', refreshToken, exports.refreshTokenOptions);
    res.status(statusCode).json({
        success: true,
        user: user,
        accessToken: accessToken
    });
};
exports.sendToken = sendToken;
