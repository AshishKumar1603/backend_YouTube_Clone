class ApiError extends Error {
    constructor (
        statusCode, 
        message="Something went wrong",
        errors= [], // for multiple error
        stack = ""
    ){
        // yha p hum error ko overwrite kr rhe hai
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack){
                 this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}