import {asyncHandler}  from "../utils/asyncHandler.js";  //Because tum async/await use karoge, aur yeh function automatically      errors ko catch karta hai —try/catch likhne ki gandagi se bachata hai.
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";   

 const registerUser = asyncHandler( async (req, res) => {
   

    //get user details from fronted
    const {fullname, email, username, password} = req.body
    console.log("email: ", email);

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
   const coverImageLocalPath = req.files?.coverImage[0]?.path;


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

 export {registerUser}

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