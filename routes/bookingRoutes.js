const router = require('express').Router({mergeParams : true})
const bookingController = require('../controllers/bookingController')
const authController = require('../controllers/authController')

router.use(authController.protect)

router.get('/checkout-session/:tourID',bookingController.getCheckoutSession)

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router
