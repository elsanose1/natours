const router = require('express').Router(); 
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')


router.use(authController.isLoggedIn)

router.get('/' ,bookingController.createBookingCheckout ,viewController.getOverview )
router.get('/me' , viewController.getAccount )
router.get('/my-tours' , viewController.getMyTours)
router.get('/tour/:slug' , viewController.getTour)
router.get('/login' , viewController.getloginForm)
router.get('/register' , viewController.getRegisterForm)


module.exports = router