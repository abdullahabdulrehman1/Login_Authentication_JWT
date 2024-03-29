import mongoose from "mongoose";
import { hashpassword, comparepassword } from "../helpers/authhelper.js";
import bcrypt from "bcrypt";
import usermodel from "../models/usermodel.js";
import authhelper from "../helpers/authhelper.js";
import json from "jsonwebtoken";
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, question } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    // if (!address) {
    //   return res.status(400).json({ message: "Address is required" });
    // }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password is too short" });
    }
    const emailcheck = await usermodel.findOne({ email });
    if (emailcheck && !email == !email) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashspassword = await authhelper.hashpassword(password);
    // const comparepassword = await authhelper.comparepassword(password, hashspassword);

    const user = await new usermodel({
      email,
      name,
      question,
      password: hashspassword,
    });
    await user.save();
    res.json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(
      `Error: REGISTERCONTROLLER ERROR ${error.message}`.red.underline.bold
    );
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const emailcheck = await usermodel.findOne({ email });
    if (!emailcheck) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const matchpassword = await authhelper.comparepassword(
      password,
      emailcheck.password
    );
    if (!matchpassword) {
      return res.status(400).json({ message: "Password is incorrect" });
    }
    // const tokenexpiration = Date.now() + 60 * 60 * 1000;
    const token = await jsonwebtoken.sign(
      {
        id: emailcheck._id,
        role: emailcheck.role,
        email: emailcheck.email,
        question: emailcheck.question,
        name: emailcheck.name,
      },
      process.env.JSON_WEB,
      { expiresIn: "5h" }
    );
    const date = new Date();
    console.log(
      `Token Generated at:- ${date.getHours()} :${date.getMinutes()}:${date.getSeconds()}`
    );
    // next()
    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      token: token,

      user: {
        id: emailcheck._id,
        role: emailcheck?.role,
        email: emailcheck?.email,
        question: emailcheck.question,
        password: emailcheck.password,
        auth: true,
        // iat: emailcheck?.iat,
        // exp: emailcheck?.exp,
      },
    });
    // next()
  } catch (error) {
    console.log(`Error: LOGINCONTROLLER ERROR ${error.message}`);
    res.status(500).json({success: false, message: "Internal server error" });
  }
};
// ... (Previous code remains unchanged)

// import { hashpassword } from "../helpers/authhelper.js"; // Update the import statement

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, question, newpassword } = req.body; // Destructure the body

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }
    if (!newpassword) {
      return res.status(400).json({ message: "New Password is required" });
    }

    // Check if the user exists
    const user = await usermodel.findOne({ email, question });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash the new password
    const hashed = await hashpassword(newpassword); // Use the hashpassword function

    // Update the user's password
    await usermodel.findOneAndUpdate({ email }, { password: hashed });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(`Error: FORGOTPASSWORDCONTROLLER ERROR ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

//   export default { registerController, loginController };

export const allUsersController = async (req, res) => {
  try {
    const users = await usermodel.find({});
    res.status(200).json({ users });
  } catch (error) {
    console.error(`Error: ALLUSERSCONTROLLER ERROR ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await usermodel.findByIdAndDelete({ _id: id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(`Error: DELETEUSERCONTROLLER ERROR ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update profile 

export const UpdateUserController = async(req,res)=>{
  try{
    const {id} = req.params;
    const {name,email,password,samepassword,question} = req.body;
   
    if(password !== samepassword){
      return res.status(400).json({message:"Password does not match"});
    }
    if(password.length < 6){
      return res.status(400).json({message:"Password is too short"});
    }
    if(password === samepassword){
      const hashed = await hashpassword(password);
    
    
    const user = await usermodel.findByIdAndUpdate({_id:id},{password: hashed});
  
    res.status(200).json({message:"User fetched successfully",success: true,user: {id: user._id,name: user.name,email: user.email,question: user.question}});
  
   
    if(!user){
      return res.status(400).json({message:"User not found"});
    }
    // res.status(200).json({message:"User updated successfully",success: true,user: {id: user._id,name: user.name,email: user.email,question: user.question}});
  }

  }
  catch(error){
    console.error(`Error: UPDATEUSERCONTROLLER ERROR ${error.message}`);
    res.status(500).json({message:"Internal server error"});
  }
}

export const fetchUserControler = async(req,res)=>{
  try{
    const {id} = req.params;
    const user = await usermodel.findById({_id:id});
    if(!user){
      return res.status(400).json({message:"User not found"});
    }
    res.status(200).json({message:"User fetched successfully",success: true,user: {id: user._id,name: user.name,email: user.email,question: user.question}});
  }
  catch(error){
    console.error(`Error: FETCHUSERCONTROLLER ERROR ${error.message}`);
    res.status(500).json({message:"Internal server error"});
  }
}


export default {
  registerController,
  deleteUserController,
  fetchUserControler,
  loginController,
  allUsersController,
  forgotPasswordController,
};
