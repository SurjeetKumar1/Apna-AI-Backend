import express from "express";
import Thread from"../models/thread.js";
import getOpenAiAPIResponse from "../utils/openAi.js";
const router=express.Router();
import "dotenv/config"
import jwt from "jsonwebtoken";

router.post("/test",async(req,res)=>{
    try{
        const thread=new Thread({
            threadId:"xyx",
            title:"Testing newThread"
        })

        const response=await thread.save();
        res.send(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Faild to save in DB"})
    }

})

//get all threads
// router.get("/thread",async(req,res)=>{
//     try{
//         //we want most recent data in the top
//         const threads=await Thread.find({}).sort({updatedAt:-1});  //-1 means we want data ne decending order acording to updatedAt property
//         res.send(threads);
//     }catch(err){
//         console.log(err);
//         res.status(500).json({error:"Failed to fetch threads"})
//     }
// })

router.get("/thread", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
  
      const threads = await Thread.find({ user: userId }).sort({ updatedAt: -1 });
  
      res.json(threads);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

//get a thread of particular threadId
router.get("/thread/:threadId",async(req,res)=>{
    const {threadId}=req.params;
       try{
      const thread= await Thread.findOne({threadId:threadId});
      if(!thread){
        return res.status(404).send("Thread not found")
      }
      res.send(thread.messages)
       }catch(err){
        console.log(err);
        res.status(500).json({error:`Failed to fetch chat for this id-> ${id}` });
       }
})

//delete thread
router.delete("/thread/:threadId",async(req,res)=>{
    const {threadId}=req.params;
    try{
       const deletedThread= await Thread.findOneAndDelete({threadId:threadId});
       if(!deletedThread){
        return res.status(404).send("Thread not found");
       }
       res.status(200).json({success:"Thread deleted successfully"});
    }catch(err){
        console.log(err);
        res.status(500).send("Failed to delete the thread");
    }
})

//post chat 
// router.post("/chat",async(req,res)=>{
//     const {threadId,message,token}=req.body;

//     if(!threadId || !message){
//        res.status(400).json({error:"Missing required filed"});
//     }

//     try{
//     let thread=await Thread.findOne({threadId:threadId});
//     if(!thread){
//         //create new thread in the Database
//         thread=new Thread({
//             threadId,
//             title:message,
//             messages:[ {
//                     role:"user",
//                     content:message
//                 }]
//         })
//     }
//     else{ //thread id exist means add new chat on this threadID
//         thread.messages.push({
//             role:"user",
//             content:message
//         })

//     }

//     // const assistantReply=5;
//     const assistantReply=await getOpenAiAPIResponse(message);

//     thread.messages.push({
//         role:"assistant",
//         content:assistantReply
//     })
//     thread.updatedAt=new Date();

//     await thread.save();
//     res.json({reply:assistantReply});

//     }catch(err){
//         console.log(err);
//         res.status(500).json({error:"Something went wrong"})
//     }
// })

function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 
  
    if (!token) return res.status(401).json({ message: "No token provided" });
  
    try {
      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
      req.user = verifiedToken;
      next();
    } catch (err) {
      console.log("Invalid token:", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  }

router.post("/chat",authMiddleware, async (req, res) => {
    const { threadId, message } = req.body;
    console.log("useresxsx",req.user);
    const userId = req.user.id; //  comes from JWT middleware
  
    if (!threadId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      let thread = await Thread.findOne({ threadId, user: userId });
  
      if (!thread) {
        thread = new Thread({
          threadId,
          title: message, 
          user: userId,   
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        });
      } else {
        // Thread already exists, add new user message
        thread.messages.push({
          role: "user",
          content: message,
        });
      }
  
      // Get assistant reply 
      const assistantReply = await getOpenAiAPIResponse(message);
  
      thread.messages.push({
        role: "assistant",
        content: assistantReply,
      });
  
      thread.updatedAt = new Date();
      await thread.save();
  
      res.json({ reply: assistantReply, threadId: thread.threadId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });



export default router;