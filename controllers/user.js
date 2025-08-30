import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.js"
import "dotenv/config"

// console.log(process.env.JWT_SECRET_KEY);


export const create=async(req,res)=>{
    console.log("create")
    const {name,password,email}=req.body;
    try{
        if(!name || !password || !email){
            return res.status(400).json({Message:"All fields are require!"});
        }
        const user=await User.findOne({email});
        if(user){
            return res.status(400).json({message:"Email already exist"})
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=new User({
            name,
            password:hashedPassword,
            email:email,
        })
        const result=await newUser.save();
        
        const token=jwt.sign({id:result._id},process.env.JWT_SECRET_KEY,{expiresIn:"7d"}) //takes three argument

// console.log("Generated token:", token);

// const check = jwt.verify(token, process.env.JWT_SECRET_KEY);
// console.log("Decoded right after sign:", check);
        res.json({token,userId:result._id,username:result.name});
    }catch(err){
        console.log("Error in signup process",err);
        res.status(500).json({message:"Server Error"});
    }
}

export const login=async(req,res)=>{
    const {email,password}=req.body;
    try{
        if(!email || !password){
            return res.status(400).json({Message:"All fields are required!"});
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid credentials!"})
        }

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials!"})
        }

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"7d"});

// const check = jwt.verify(token, process.env.JWT_SECRET_KEY);
// console.log("Decoded right after sign:", check);

        res.json({token,userId:user._id,username:user.name})

    }catch(err){
        console.log("Error during login",err.message);
        res.status(500).json({message:"Server Error!"});

    }
}


