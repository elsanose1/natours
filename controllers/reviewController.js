const Review = require('../models/reviewModle');
const Factory = require('./handlerFactory')


exports.setTourUserIDs = (req, res, next)=>{

    if (!req.body.tour) req.body.tour = req.params.tourID;
    req.body.user = req.user.id
    next()
}

exports.createReview = Factory.createOne(Review)

exports.getAllReviews = Factory.getAll(Review)

exports.getReview = Factory.getOne(Review)

exports.updateReview = Factory.updateOne(Review)

exports.deleteReview = Factory.deleteOne(Review)