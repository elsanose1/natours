const Tour = require('../models/tourModle');
const Booking = require('../models/bookingModle');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync( async(req ,res ,next)=>{
    const tours = await Tour.find();

    res.status(200).render('overview',{
        title : 'All Tours',
        tours
    })
})

exports.getTour = catchAsync( async(req ,res ,next)=>{
    const tour = await Tour.findOne({slug : req.params.slug}).populate({
        path: 'reviews',
        fields : 'review rating user'
    })

    // if(!tour){
    //     return next(new AppError("There's no tour with this name" , 404))
    // }

    res.status(200).render('tour',{
        title : tour.name,
        tour
    })
})

exports.getloginForm = catchAsync( async(req ,res ,next)=>{
    if (res.locals.user) {
        return res.redirect('/');
    }

    res.status(200).render('login',{
        title : 'Login',
    })
})

exports.getRegisterForm = catchAsync( async(req ,res ,next)=>{
    if (res.locals.user) {
        return res.redirect('/');
    }

    res.status(200).render('register',{
        title : 'Register',
    })
})

exports.getAccount = catchAsync( async(req ,res ,next) =>{
    if (!res.locals.user) {
        return res.redirect('/login'); 
    }
    res.status(200).render('account' ,{
        title : 'My Account'
    })
})

exports.getMyTours = catchAsync( async(req ,res ,next) =>{
    if (!res.locals.user) {
        return res.redirect('/login'); 
    }

    const bookings = await Booking.find({user : res.locals.user.id})
    
    const tourIDs = bookings.map(el => el.tour)
    const tours = await Tour.find({_id : {$in : tourIDs}})
    
    res.status(200).render('overview' ,{
        title : 'My Tours',
        tours
    })
})