import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const app=express();
const port=process.env.PORT || 3000;


//algo to be used in JWT authentication RS256



app.listen(port,()=>{
    console.log(`Listening to port ${port}...`);
});