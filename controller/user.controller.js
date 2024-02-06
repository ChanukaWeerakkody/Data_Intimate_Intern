"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.activateUser = exports.createActivationToken = exports.registrationUser = void 0;
var path = require("path");
require('dotenv').config();
var user_model_1 = require("../models/user.model");
var ErrorHandler_1 = require("../util/ErrorHandler");
var catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
var jwt = require("jsonwebtoken");
var ejs = require("ejs");
var sendMail_1 = require("../util/sendMail");
var jwt_1 = require("../util/jwt");
//Register user
exports.registrationUser = (0, catchAsyncErrors_1.CatchAsyncError)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, email, password, isEmailExists, user, activationToken, activationCode, data, html, error_1, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, name_1 = _a.name, email = _a.email, password = _a.password;
                return [4 /*yield*/, user_model_1.default.findOne({ email: email })];
            case 1:
                isEmailExists = _b.sent();
                if (isEmailExists) {
                    return [2 /*return*/, next(new ErrorHandler_1.default("Email already exists", 400))];
                }
                user = {
                    name: name_1,
                    email: email,
                    password: password,
                };
                activationToken = (0, exports.createActivationToken)(user);
                activationCode = activationToken.activationCode;
                data = { user: { name: user.name }, activationCode: activationCode };
                html = ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, sendMail_1.default)({
                        email: user.email,
                        subject: "Activate your account",
                        template: "activation-mail.ejs",
                        data: data
                    })];
            case 3:
                _b.sent();
                res.status(201).json({
                    success: true,
                    message: "Account created successfully, please check ".concat(user.email, " to activate your account"),
                    activationToken: activationToken.token,
                });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                return [2 /*return*/, next(new ErrorHandler_1.default(error_1.message, 400))];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_2 = _b.sent();
                return [2 /*return*/, next(new ErrorHandler_1.default(error_2.message, 400))];
            case 7: return [2 /*return*/];
        }
    });
}); });
var createActivationToken = function (user) {
    var activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    var token = jwt.sign({
        user: user,
        activationCode: activationCode
    }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m"
    });
    return { token: token, activationCode: activationCode };
};
exports.createActivationToken = createActivationToken;
exports.activateUser = (0, catchAsyncErrors_1.CatchAsyncError)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, activation_token, activation_code, newUser, _b, name_2, email, password, existsUser, user, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _a = req.body, activation_token = _a.activation_token, activation_code = _a.activation_code;
                newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
                if (newUser.activationCode !== activation_code) {
                    return [2 /*return*/, next(new ErrorHandler_1.default("Invalid activation code", 400))];
                }
                _b = newUser.user, name_2 = _b.name, email = _b.email, password = _b.password;
                return [4 /*yield*/, user_model_1.default.findOne({ email: email })];
            case 1:
                existsUser = _c.sent();
                if (existsUser) {
                    return [2 /*return*/, next(new ErrorHandler_1.default("Email already exists", 400))];
                }
                return [4 /*yield*/, user_model_1.default.create({
                        name: name_2,
                        email: email,
                        password: password
                    })];
            case 2:
                user = _c.sent();
                res.status(201).json({
                    success: true,
                    message: "Account activated successfully"
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _c.sent();
                return [2 /*return*/, next(new ErrorHandler_1.default(error_3.message, 400))];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.loginUser = (0, catchAsyncErrors_1.CatchAsyncError)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, isPasswordMatched, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, next(new ErrorHandler_1.default("Please enter email and password", 400))];
                }
                return [4 /*yield*/, user_model_1.default.findOne({ email: email }).select("+password")];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, next(new ErrorHandler_1.default("Invalid email or password", 400))];
                }
                return [4 /*yield*/, user.comparePassword(password)];
            case 2:
                isPasswordMatched = _b.sent();
                if (!isPasswordMatched) {
                    return [2 /*return*/, next(new ErrorHandler_1.default("Invalid email or password", 400))];
                }
                (0, jwt_1.sendToken)(user, 200, res);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                return [2 /*return*/, next(new ErrorHandler_1.default(error_4.message, 400))];
            case 4: return [2 /*return*/];
        }
    });
}); });
