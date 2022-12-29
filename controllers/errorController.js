const AppError = require('../utils/appError')


const handleCastErrorDB = (error) =>{
    const message = `Invaild ${error.path} : ${error.value} `
    return new AppError(message ,400)
}

const handleDublicatedErrorDB = (error) =>{
    const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Dublicated fi  eld value: ${value}. please use another value!`

    return new AppError(message ,400)

}

const handleValidationErrorDB = (error) =>{
    const errors = Object.values(error.errors).map(el => el.message)

    const message = `Invaild input Data . ${errors.join('/ ')}`
    return new AppError(message ,400);
}

const handleJWTError = (error) =>{
    let message ;
    if (error.name === 'JsonWebTokenError') {
        message = 'Access denied . Invailed token'
    }else if (error.name === 'TokenExpiredError') {
        message = 'Token has been expired'
    }
    return new AppError(message , 401)
}

const devError = (err , req, res)=>{
    // for api
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status : err.status,
            Error : err,
            message : err.message,
            stack : err.stack
        })
    }else{
        // for rendring pages

        res.status(err.statusCode).render('error',{
            title : 'Somthing went Wrong!',
            msg : err.message
        })
    }

}

const productionError = (err , req, res)=>{
    if (req.originalUrl.startsWith('/api')) {
        // for api
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status : err.status,
                message : err.message,
            })
        }else{
            console.error(err);
            res.status(500).json({
                status : 'Error',
                message : 'Something went very wrong!',
            })
        }
    }else{
        // for rendreing pages
        if (err.isOperational) {
            res.status(err.statusCode).render('error',{
                title : 'Somthing went Wrong!',
                msg : err.message
            })
        }else{
            console.error(err);
            res.status(err.statusCode).render('error',{
                title : 'Somthing went Wrong!',
                msg : 'Something went very wrong!'
            })
        }

    }
} 

module.exports = (err ,req ,res ,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error"

    if (process.env.NODE_ENV ==='development') {
        devError(err,req,res)
            
    }else if (process.env.NODE_ENV ==='production') {
        let error = err
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.name === "ValidationError") error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') error = handleJWTError(error);
        if (error.code === 11000) error = handleDublicatedErrorDB(error);

        productionError(error,req,res)
    }
}