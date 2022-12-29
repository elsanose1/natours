const express = require('express');
const authController = require('../controllers/authController')
const tourController = require('../controllers/tourController');
const reviewRouter = require('./reviewRoutes')

const router = express.Router();

router.use('/:tourID/reviews',reviewRouter)

router.route('/top-5')
.get(tourController.aliasTopTours ,tourController.getAllTour)

router.get('/tour-within/:distance/center/:latlng/unit/:unit',tourController.getTourWithin)
router.get('/distances/:latlng/unit/:unit',tourController.getDistances)

router.route('/tour-stats')
.get(tourController.getTourStats)

router.route('/monthly-plan/:year')
.get(authController.protect,authController.restrictTo('lead-guide', 'admin' , 'guide'),tourController.getMonthlyPlan)

router.route('/')
.get(tourController.getAllTour)
.post(authController.protect,authController.restrictTo('lead-guide', 'admin') ,tourController.createTour);

router.route('/:id')
.get(tourController.getTourById)
.patch(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.updateTour
)
.delete(authController.protect, authController.restrictTo('admin','lead-guide'),tourController.deleteTour);




module.exports = router;
