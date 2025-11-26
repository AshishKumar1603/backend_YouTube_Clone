const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}


export {asyncHandler}

// using higher order fn here: async (req, res) = fn , asyncHandler(fn) = wrapper bana raha hai


// const asyncHandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req, res, next)
//     }catch (error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })

//     }

// }