import express from "express";
const userRouter=express.Router();
import {create,login} from "../controllers/user.js"


userRouter.post("/create",create);
userRouter.post("/login",login);

export default userRouter;