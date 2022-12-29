const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require("../models/tourModle");
const Booking = require("../models/bookingModle");
const AppError = require("../utils/appError");
const Factory = require('./handlerFactory')
const catchAsync = require("../utils/catchAsync");


exports.getCheckoutSession = catchAsync(async (req ,res ,next)=>{
    // get tour
    const tour = await Tour.findById(req.params.tourID);

    // create checkout session

    const session = await stripe.checkout.sessions.create({
        success_url : `${req.protocol}://${req.get('host')}/?tour=${tour._id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url : `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email : req.user.email,
        client_reference_id: req.params.tourID,
        mode: 'payment',
        line_items : [
            {
                name : `${tour.name} tour`,
                description : tour.summary,
                images : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount : tour.price * 100,
                currency: 'usd',
                quantity: 1,
            }
        ]
    })
    // create session as a  response

    res.status(200).json({
        status : 'success',
        session
    })
});

exports.createBookingCheckout = catchAsync(async (req, res, next)=>{
    const {tour , user, price} = req.query;

    if(!tour || !user || !price) return next()
    await Booking.create({tour , user, price});

    res.redirect(`${req.protocol}://${req.get('host')}/`)
})


exports.createBooking = Factory.createOne(Booking);
exports.getBooking = Factory.getOne(Booking);
exports.getAllBookings = Factory.getAll(Booking);
exports.updateBooking = Factory.updateOne(Booking);
exports.deleteBooking = Factory.deleteOne(Booking);