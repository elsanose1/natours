const crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// User schema
const userShema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,"Please tell us your name"],
    },
    email : {
        type : String,
        required : [true,'please provide your email'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail , 'please provide vaild email']

    },
    photo : {
        type : String,
        default : 'default.jpg'
    },
    role : {
        type : String,
        enum : ['user' , 'guide' , 'lead-guide' , 'admin'],
        default : 'user'
    },
    password : {
        type : String,
        required : [true,'please provide a password'],
        minlength : 8,
        select : false
    },
    confirmPassword : {
        type : String,
        required : true,
        validate : {
            validator : function(val){
                return val === this.password
            },
            message : "Confirm Password does't match password"
        },
    },
    passwordChangedAt : Date,
    PasswordResetToken : String,
    PasswordResetExpires : Date,
    active : {
        type : Boolean,
        default : true,
        select : false
    }
},{timestamps : true})


// update padsswordChangedAt on change password
userShema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next()
})

// eleminate inactive users from selecting
userShema.pre(/^find/ , function(next) {
    this.find({active : {$ne : false}});
    next();
})

// check if password given is correct
userShema.methods.checkPassword = async function (givenPassword , userPassword) {
    return await bcrypt.compare(givenPassword , userPassword)
}

// check if password changed after token signed
userShema.methods.isPasswordChanged = async function (JWTTime){
    if(this.passwordChangedAt){
        const modifiedTime = parseInt(this.passwordChangedAt.getTime() /1000,10)
        return JWTTime <= modifiedTime
    }

    return false;
}

// create token for reset password
userShema.methods.createPasswordResetToken =  function () {
    //create token
    const resetPassword = crypto.randomBytes(32).toString('hex');

    // hash token and store it in DB
    this.PasswordResetToken =  crypto.createHash('sha256').update(resetPassword).digest('hex');

    // set expires date
    this.PasswordResetExpires = Date.now() + 10 * 60 * 1000

    return resetPassword;
}

// check and crypt password
userShema.pre('save' , async function (next){
    if (!this.isModified('password'))  return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined
    next();
})



const User = mongoose.model('User' , userShema);

module.exports = User;