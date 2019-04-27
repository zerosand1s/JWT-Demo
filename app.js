var express = require('express');
var app = express();
const dotenv = require('dotenv');
dotenv.config();
var db = require('./db');

const UserController = require('./user/UserController');
const AuthController = require('./auth/AuthController');

app.use('/users', UserController);
app.use('/api/auth', AuthController);

module.exports = app;