import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


// Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    //yha p hum ek method use krenge aur uss method mai hum parameter ko local file ka path denge aur usse upload krdenge agr successfully upload ho gya to file ko unlink kr denge

    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null
            //upload the file on cloudinay
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type: "auto"
            })
            // file has been uploaded successfully
            //console.log("file is uploaded on cloudinary", response.url);
            fs.unlinkSync(localFilePath)
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
            return null;
        }
    }

    export {uploadOnCloudinary}