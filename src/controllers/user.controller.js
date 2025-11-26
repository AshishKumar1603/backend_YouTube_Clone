import {asyncHandler}  from "../utils/asyncHandler.js";  //Because tum async/await use karoge, aur yeh function automatically      errors ko catch karta hai —try/catch likhne ki gandagi se bachata hai.



 const registerUser = asyncHandler( async (req, res) => {
     res.status(200).json({
        message: "hare ram hare krishna ji"
    })
})

 export {registerUser}

/* Interview Answer (use this exact line)

 “We don’t put asyncHandler directly inside routes because routes should only map endpoints to handlers. Putting logic inside routes creates unmaintainable, non-testable, tightly coupled code. Controllers separate business logic from routing and keep the architecture clean and scalable.”  */

 /* “Whenever a user clicks the login button → HTTP request goes to backend → route receives it → matches the URL → controller runs → response returns.” */