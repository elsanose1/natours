const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/userModle')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const Factory = require('./handlerFactory')

// const multerStorage = multer.diskStorage({
//     destination : (req , file, cb)=>{
//         cb(null ,'public/img/users');
//     },
//     filename: (req , file , cb)=>{
//         const ext = file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req ,file ,cb) =>{
    if (file.mimetype.startsWith('image')) {
         cb(null , true);
    }else{
        cb(new AppError('Not an image! please upload only image' ,400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
});

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = async(req ,res ,next)=>{
    if(!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`
    )

    next()
}



const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

exports.updateMe = catchAsync( async (req, res, next)=>{
    
    const filteredBody = filterObj(req.body,'name' , 'email') 
    if (req.file) filteredBody.photo = req.file.filename;   

    // update data & save
    const ChangedUser = await User.findByIdAndUpdate(req.user.id , filteredBody,{
        new:true,
        runValidators : true
    })

    res.status(201).json({
        status : 'success',
        message : "updated",
        data : {
            user : ChangedUser
        }
    })

    
})

exports.deleteMe = catchAsync( async (req, res, next) =>{
    
    const { password } = req.body ;
    

    const user = await User.findById(req.user._id).select('+password')
    
    if (!(await user.checkPassword(password , user.password))) {
        return next(new AppError('Password is Wrong' , 400));
    }
    
    await User.findByIdAndUpdate(req.user.id , {active : false} )

    res.status(201).json({
        status : "success",
        token: "",
        message : "User Deleted"
    })


})

exports.getMe = (req ,res ,next)=>{
    req.params.id = req.user.id
    next()
}


exports.addUser = (req , res)=>{
    const newUser = req.body
}

exports.getAllUsers = Factory.getAll(User)
exports.getOneUser = Factory.getOne(User)
exports.updateUser = Factory.updateOne(User)
exports.deleteUser = Factory.deleteOne(User)

