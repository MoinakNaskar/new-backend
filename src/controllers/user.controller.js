import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary} from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResposne.js";

const registerUser = asyncHandler( async (req,res)=>{
    const {fullName,email,userName,password} = req.body
    console.log("email" , email);
    if(
        [fullName , email , userName , password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({
        userName
    })

    if(existedUser){
        throw new ApiError(409,"User with email an username already exists")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalPath)
  if(!avatar){
          throw new ApiError(400, "Avatar field is required");
  }


    const user = await User.create({
        fullName,
        avatar: avatar?.url||"",
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )




})

export {registerUser}