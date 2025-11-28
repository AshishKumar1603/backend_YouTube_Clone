import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken" /* “A token is a signed string issued by the server after login. It works like a digital ID card   that the client sends in every request, so the server can authenticate and authorize the user without rechecking the password.” */
import bcrypt from "bcrypt" // direct encryption is not possible here so we some mongodb hooks (middleware)

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
     email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
     fullname:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
     avatar:{
        type: String, // cloudinary url
        required:true
     },
     coverImage:{
        type: String, // cloudinary url
     },
     wathchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
     ],
     password:{
        type:String,
        required: [true, "Password is required"]
     },
     refreshToken: {
        string: String
     }

},{timestamps: true})

// hum iss pre hook ka use just data ko call krne se phle krte hai jaise password ko encrypt .. 
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
      {
         _id : this._id,
         email: this.email,
         username: this.username,
         fullname: this.fullname
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }  
   )
}
userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
      {
         _id : this._id,
         email: this.email,
         username: this.username,
         fullname:this.fullname
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
         expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }  
   )
}
export const User = mongoose.model("User", userSchema)

