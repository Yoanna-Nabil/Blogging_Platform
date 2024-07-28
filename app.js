const express= require('express');
const {connectBD}= require('./config/connectToDB');
const dotenv= require("dotenv");
const app= express();
var cors = require('cors');
const { errorHandler, notFound } = require('./middlewares/error');
const xss = require('xss-clean');
const rateLimitting= require("express-rate-limit");
const helmet= require("helmet");
var hpp = require('hpp');
const {logger}= require('./Middlewares/logger');

dotenv.config();
connectBD();
app.use(express.json());
app.use(logger);
app.use(cors({
    origin: "http://localhost:3000"
}));
app.use(helmet());
app.use(hpp());
app.use(xss());
app.use(rateLimitting({
    windowMs: 20 * 60 * 1000, //60 minutes
    max:200
}));

const authPath= require('./routes/authRoute');
app.use('/api/auth', authPath);

const userPath= require('./routes/usersRoute');
app.use('/api/users', userPath);

const postPath= require('./routes/postRoute');
app.use('/api/posts', postPath);

const commentPath= require('./routes/commentsRoute');
app.use('/api/comments', commentPath);

const categoryPath= require('./routes/categoryRoute');
app.use('/api/categories', categoryPath);

const passwordPath= require('./routes/passwordRoute');
app.use('/api/password', passwordPath);

app.use(notFound);
app.use(errorHandler);

app.listen(5000, () => 
 console.log("Server running on port 5000"));

