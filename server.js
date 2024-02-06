"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("./app");
require('dotenv').config();
var db_1 = require("./util/db");
//create server
app_1.app.listen(process.env.PORT, function () {
    console.log("server is connected with ".concat(process.env.PORT));
    (0, db_1.default)();
});
