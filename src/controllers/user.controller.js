import {asyncHandler}  from "../utils/asyncHandler.js";  //Because tum async/await use karoge, aur yeh function automatically      errors ko catch karta hai —try/catch likhne ki gandagi se bachata hai.
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"; 
import jwt from "jsonwebtoken" 

const generateAccessandrefreshToken = async(userId) => {
   try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken  // put it in database 
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating access and refresh token")
   }
}


 const registerUser = asyncHandler( async (req, res) => {
   

    //get user details from fronted
    const {fullname, email, username, password} = req.body
    console.log("email: ", email);

 

    // Validation - not empty
   if(
    [fullname, email, username, password].some((field) =>  
      field?.trim() === "") //optional chaining
   )
   {
      throw new ApiError(400, "All fields are required")
   }
   
/* 
   if (await User.exists({ $or: [{ username }, { email }] })) {
  throw new ApiError(409, "User already exists");
} */



   // user already exist
     const existUser= await User.findOne ({
      $or: [{ username }, { email }]
   } 
)

   if(existUser){
      throw new ApiError(409, "User with emial or username already exists")
   } 

   const avatarLocalPath= req.files?.avatar[0]?.path; 
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(
   req.files && 
   Array.isArray(req.files.coverImage) && 
   req.files.coverImage.length > 0 
) {
   coverImageLocalPath = req.files.coverImage[0].path
  }


   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is required")
   }
  /*✔️ One-line explanation (interview level)

 “I use optional chaining to safely access uploaded file paths from Multer. [0] is because Multer stores files in arrays. If the avatar file is missing, avatarLocalPath becomes undefined and I throw a 400 validation error.” */

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
        throw new ApiError(400, "Avatar file is required")
   }

    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })

     const createdUser = await User.findById(user._id).select("-password -refreshToken")

     if(!createdUser){
      throw new ApiError(500, "Something went wrong while registering the user")
     }

     return res.status(201).json(
      new ApiResponse(200, createdUser, "User register Successfully")
     )

   
 
     
})

const loginUser = asyncHandler( async (req, res) => {
   //req.body -> data(get value from client side)
   //validate data as per your need (username base or email base)
   //check user exixts or find user
   //password check
   //access and refreshtoken
   //send cookie
  // console.log('>>> loginUser called', req.method, req.url, 'body=', req.body);


   const {email, username, password} = req.body
   //if(!username && !email){
   if(!(username || email)){
      throw new ApiError(400, "username or email is required")  
   }


     const user= await User.findOne({
      $or:[{username}, {email}]
      
   })
   if(!user){
      throw new ApiError(404, "User does not exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401, "Password incoorect")
   }

   const {accessToken, refreshToken} = await generateAccessandrefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).
   select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200,
         {
            user: loggedInUser, accessToken, refreshToken
         }, 
         "User logged In Successfully"
      )
   )

})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )           
   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged Out"))
   
})

const refreshAccessToken = asyncHandler(async(req, res) =>{

/*    LOGIN TIME:
Server -> AccessToken + RefreshToken generate
Server -> Refresh token (hashed) store in DB
Server -> Refresh token (plain) send as cookie
Client -> AccessToken use for all APIs

WHEN ACCESS TOKEN EXPIRES:
Frontend -> calls /refresh-token
Browser -> automatically sends refreshToken cookie
Server -> verifies refresh token with hashed copy in DB
Server -> issues new access token */

     
   const incomingRefreshToken = req.cookies.
   refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(401, "Unauthorized request")
   }

  try {
    const decodedToken = jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
    )
 
     const user = await User.findById(decodedToken?._id)
 
     if(!user){
       throw new ApiError(401, "Invalid refresh token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401, "Refresh token is expired or used")
     }
 
     const options = {
       httpOnly: true,
       secure:true
     }
 
     const {accessToken, newRefreshToken} = await generateAccessandrefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
       new ApiResponse(
          200,
          {accessToken, refreshToken: newRefreshToken},
          "Access token refreshed"
       )
     )
  } catch (error) {
   throw new ApiError(401, error?.message || "Invalid refresh token")
   
  }
})

const changecurrentPassword = asyncHandler(async(req, res) => {

   const {oldPassword, newPassword, confirmPassword} = req.body

   if(!oldPassword || !newPassword || !confirmPassword){
      throw new ApiError(400, "All fields are required");
   }

   if(newPassword !== confirmPassword){
      throw new ApiError(400, "newPassword and confirmPassword do not match")
   }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.
    isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
      throw new ApiError(400, "Invalid old Password")
    }

    if(oldPassword === newPassword){
      throw new ApiError(400, "New password cannot be the same as old password");
   }

    user.password = newPassword  //Assign the new password and save the user so hashing runs in the pre-save hook.
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))

})

const getCurrentUser = asyncHandler(async(req, res) => {
   return res
   .status(200)
   .json(200, req.user, "current user fecthed successfully")
})

const updateAccountDetails = asyncHandler(async(req, res) => {

   const {fullname, email} = req.body

   if(!fullname || !email){
      throw new ApiError(400, "All fields are required")
   }

   const user = User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullname,
            email: email
         }

      },
      {new :true}

   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, user, "Account details updated successfully"))


})

const updateUserAvatar = asyncHandler(async(req, res) => {
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is missing")
   }
   
    const avatar = uploadOnCloudinary(avatarLocalPath)

    if(avatar.url){
      throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            avatar: avatar.url
         }
      },
      {new: true}

    ).select("-password")

     return res
    .status(200)
    .json(
      new ApiError(200, user, "avatar updated successfully")
    )

})

const updateUserCoverImage = asyncHandler(async(req, res) => {
   const coverImageLocalPath = req.file?.path

   if(!coverImageLocalPath){
      throw new ApiError(400, "CoverImage file is missing")
   }
   
    const coverImage = uploadOnCloudinary(coverImageLocalPath)

    if(coverImage.url){
      throw new ApiError(400, "Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            coverImage: coverImage.url
         }
      },
      {new: true}

    ).select("-password")

    return res
    .status(200)
    .json(
      new ApiError(200, user, "cover image updated successfully")
    )

})





 export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changecurrentPassword,
   getCurrentUser,
   updateUserAvatar,
   updateUserCoverImage
}

/* Interview Answer (use this exact line)

 “We don’t put asyncHandler directly inside routes because routes should only map endpoints to handlers. Putting logic inside routes creates unmaintainable, non-testable, tightly coupled code. Controllers separate business logic from routing and keep the architecture clean and scalable.”  */

 /* “Whenever a user clicks the login button → HTTP request goes to backend → route receives it → matches the URL → controller runs → response returns.” */

  /* Step for register User*/
    //_1. get user details from fronted
    //_2. Validation - not empty
    //_3. check if user already exists: username, email
    //_4. check for images, check for avatar
    //_5. uplaod them to cloudinary, avatar
    //_6. create user object - create entry in db yha hum mongodb use kr rhe hai jha noseql db use hai issliye object create krenge
    //_7. remove password and refresh token field from response
    //_8. check for user creation
    //_9. return response 




     /*  if(fullname === ""){
      throw new ApiError(400, "fullname is required")
   } */  //ye wrong way hai kyu agr user ne "sapce= "  " " de to wo bhi accept kr lega , null bhi accept kr lega..

   // best and simple way
  /*  if (!fullname || fullname.trim() === "") {
    throw new ApiError(400, "fullname is required");
} */

   // use of forEach

   /* const requiredField =["fullname", "email", "username", "password"];
   requiredField.forEach(field => {
      if(!req.body[field]?.trim()){
         throw new ApiError(400, `${field} is required`)
      }
      
   }); */