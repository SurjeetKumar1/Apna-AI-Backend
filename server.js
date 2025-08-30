import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import 'dotenv/config'
import chatRoutes from "./routes/chat.js"
import userRouter from "./routes/user.js"

const app=express();
const PORT=8080;

//these two middleware helps us when we connect our frontend to backend
app.use(express.json());   //parse our incomming request
app.use(cors());

app.use("/api",chatRoutes);
app.use("/user",userRouter);


app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);
    connectDB(); //jab hamara server enable hoga tabhi DB se connection bi ho jayga
})

const connectDB=async()=>{
    mongoose.connect(process.env.DB_URL).then(()=>{
        console.log("connect to DB");
    }).catch((err)=>{
        console.log("DB connection error",err);
    })
}



