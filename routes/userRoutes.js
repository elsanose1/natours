const express = require('express')

const userController = require('../controllers/userController')
const authController = require('../controllers/authController')



const router = express.Router()

router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/logout',authController.logout)
router.post('/forgotpassword',authController.forgotPassword)
router.patch('/resetpassword/:token',authController.resetPassword)


router.use(authController.protect)

router.patch('/updatePassword',authController.updatePassword)

router.get('/me',userController.getMe,userController.getOneUser)
router.patch('/updateMe',
userController.uploadUserPhoto,
userController.resizeUserPhoto,
userController.updateMe)
router.delete('/deleteMe',userController.deleteMe)

router.route('/')
.get(authController.restrictTo('admin'),userController.getAllUsers)
.post(authController.restrictTo('admin'),userController.addUser)


router.use(authController.restrictTo('admin'))

router.route('/:id')
.get(userController.getOneUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports = router