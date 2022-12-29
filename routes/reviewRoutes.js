const router = require('express').Router({mergeParams : true})
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

router.use(authController.protect)

router.route('/')
.post(authController.restrictTo('user'),reviewController.setTourUserIDs,reviewController.createReview)
.get(reviewController.getAllReviews)

router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('admin','user'),reviewController.updateReview)
.delete(authController.restrictTo('user' , 'admin'),reviewController.deleteReview)

module.exports = router