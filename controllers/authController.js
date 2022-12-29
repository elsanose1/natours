const {promisify} = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const User = require('../models/userModle');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

const signToken = id =>{
    return jwt.sign({id : id,},process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRES
    })
}

const createSendToken = (user , statusCoed , res) =>{

    // sign new token
    const token = signToken(user._id)

    // handle cookie options
    const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly : true
    }

    // check if project on production mode 
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // send token
    res.cookie('jwt' , token , cookieOptions)


    // remove passwrod from output
    user.password = undefined

    res.status(statusCoed).json({
        status : 'success' ,
        token,
        data : {
            user
        }
    })
}


exports.signup = catchAsync(async (req ,res ,next)=>{

    // const newUser = await User.create(req.body)  => security flow

    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword
    })
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser , url).sendWelcome()

    const token = signToken(newUser._id)
    createSendToken(newUser , 201, res)

})

exports.login = catchAsync( async (req, res, next) =>{
    const {email , password} = req.body;

    // check if email & password not null 
    if (!email || !password) {
        return next(new AppError('please provide email and password' ,400))
    }

    const user = await User.findOne({email}).select('+password');
    
    // check if email & password are correct 
    if (!user || !(await user.checkPassword(password , user.password))) {
        return next(new AppError('Email or Password is wrong',401))
    }
    
    // send Data if everything is okay
    createSendToken(user , 200, res)

})

exports.logout = catchAsync( async (req, res, next)=>{
    res.cookie('jwt' , 'loggedout' , {
        expires : new Date(Date.now() + 3000),
        httpOnly : true
    })

    res.status(200).json({status : 'success'})
})

exports.protect = catchAsync(async (req ,res ,next)=>{
    let token ;
    // Getting Token and check of is it there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    }
    
    if (!token) {
        return next(new AppError('You are not logged in! plz login to get access',401))
    }
    // verification Token
    const decodedToken = await promisify(jwt.verify)(token,process.env.JWT_SECRET,)
    
    // check if user still exists
    const currentUser = await User.findById(decodedToken.id)

    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exists.',401))   
    }

    // check if user Changed password after the token was issued
    if((await currentUser.isPasswordChanged(decodedToken.iat))){
        return next( new AppError('Please login Again .',401))
    }


    // All are clear
    req.user = currentUser
    next()
})

// only for render pages
exports.isLoggedIn = async (req ,res ,next)=>{
    // Getting Token and check of is it there
    if(req.cookies.jwt){
        try {
            // verify token
            const decodedToken = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET,)
            
            // check if user still exists
            const currentUser = await User.findById(decodedToken.id)

            if (!currentUser) {
                return next()   
            }

            // check if user Changed password after the token was issued
            if((await currentUser.isPasswordChanged(decodedToken.iat))){
                return next()
            }


            // All are clear
            res.locals.user = currentUser
            
            return next()
        } catch (error) {
            return next() 
        }
    }
    next()
}

exports.restrictTo = (...roles)=>{
    
    return catchAsync( async (req ,res ,next) =>{

        // check if user role allow to do action
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action',403))
        }
        next()
    })
}

exports.forgotPassword = catchAsync( async (req, res, next)=>{
    // Get user based on email
    const user = await User.findOne({email : req.body.email});
    if(!user){
        return next(new AppError("There's no user with this email",404))
    }

    // Generate random token

    const resetToken = user.createPasswordResetToken()

    await user.save({validateBeforeSave : false});

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`

    // Send email and res
    try {

        // await sendEmail({
        //     email : user.email,
        //     subject : "Reset Your Password (valid for 10 mins)",
        //     message
        // })
        await new Email(user,resetURL).sendPasswordReset()
    
        res.status(200).json({
            status : 'success',
            message : 'email has sent to your inbox'
        })
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave : false});
        console.log(error);
        return next(new AppError('There was an error sending the email . Try again later',500))
    }
})

exports.resetPassword = catchAsync( async (req, res, next)=>{
    // 1) Get User based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
            PasswordResetToken : hashedToken ,
            PasswordResetExpires : {$gt : Date.now()}
        })
    
    // 2) Check expire date for token and user
    if (!user) {
        return next(new AppError('Token is invaild or expired',400))
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save()
    
    // 3) Log User in  ,send JWT
    createSendToken(user , 201,res);
})

exports.updatePassword = catchAsync ( async (req, res, next)=>{
    // 1) Get user with password field
    const user = await User.findById(req.user._id).select('+password')

    // 2) Check password
    const {oldPassword , newPassword , confirmPassword} = req.body;
    if (!(await user.checkPassword(oldPassword , user.password))) {
        return next(new AppError("Password is wrong Please try again",400))
    }

    // 3) Change Password
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    await user.save()

    // 5) sign & send new token
    createSendToken(user , 201 , res)
})