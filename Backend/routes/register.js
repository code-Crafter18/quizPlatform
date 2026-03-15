import express from "express";
import User from "../models/user.js";

const registerrouter=express.Router();

registerrouter.post("/register",async(req,res)=>{
  try {
    if(await User.findOne({email:req.body.email})){
      return res.status(400).json({error:"email already exists"});
    }
    const user = await User.create(req.body);
    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({error: "Registration failed", details: error.message});
  }
});

export default registerrouter;
