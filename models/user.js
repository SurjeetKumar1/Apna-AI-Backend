// const mongoose=require("mongoose");
// const {Schema}=mongoose;
import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
})

const User=mongoose.model("User",UserSchema);
export default User;