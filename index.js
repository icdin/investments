const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression')
const helmet = require('helmet')
const bodyParser = require('body-parser')
require('dotenv').config();
const {DOMAINS,API_URL,DB} = require('./config/config')
const cors = require('cors');
const userRoute = require('./routes');


const app = express();
app.listen(API_URL,()=>{
    console.log(`App running on port ${API_URL}.`);
})
mongoose.set('strictQuery',true);
mongoose.connect(DB);
mongoose.connection.on('connected',()=>{
        console.log('Connected to the db');
})
mongoose.connection.on('error',()=>{
    console.log('Failed to connect  to db');
})

app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.text({ limit: '200mb' }));
app.use(express.json());
app.use(cors({origin:DOMAINS}));
app.use(compression())
app.use(helmet())
app.use(userRoute);