import multer  from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")  //temporary folder jaha file kuch second/minute ke liye rahegi.
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // ye kuch samay k liye hi hamare paas rahega uske baad hum delete kr denge, ye file ka name show krta hai
  }
})

export const upload = multer({ 
    storage, 
})

//Browser se aayi file ko backend ke /public/temp folder me temporarily save karna
 //jisse tum usko Cloudinary ya S3 par upload kar sako.