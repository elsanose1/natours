const mongoose = require('mongoose') 
const Tour = require('./tourModle')
const reviewSchema = new mongoose.Schema({
    review : {
        type : String,
        required : [true,'you must type a review'],
        min : [5, 'minimum legnth is 5 charachter'],
        max : [90, 'maximum legnth is 90 charachter'],
    },
    rating : {
        type : Number,
        required : [true , 'You must enter a rating'],
        min : [1,'Rating must be between 1 : 5'],
        max : [5,'Rating must be between 1 : 5'],
    },
    tour :{
            type : mongoose.Schema.ObjectId,
            ref : 'Tour',
            required : true
        },
    user : {
            type : mongoose.Schema.ObjectId,
            ref : 'User',
            required : true
        },
     
},{
    timestamps : true,
    toJSON : {virtuals : true},
    toObject : {virtuals  : true},
})

reviewSchema.index({tour : 1 , user : 1} , {unique : true});


reviewSchema.pre(/^find/ , function(next){
    this.populate([
        {
            path : 'user',
            select : 'name photo'
        },
    ])
    
    next()
})

reviewSchema.statics.calcAverageRatings = async function(tourID) {
    const stats = await this.aggregate([
        {
            $match : {tour : tourID} 
        },
        {
            $group : {
                _id : '$tour',
                nRating : {$sum : 1},
                avgRating : {$avg : '$rating'},
            },
        }
    ])

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourID , {
            ratingsAverage : stats[0].avgRating,
            ratingsQuantity : stats[0].nRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourID , {
            ratingsAverage : 4.5,
            ratingsQuantity : 0
        })
    }
}

reviewSchema.post('save' , function(){
    this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.post(/^findOneAnd/, function(doc){
    doc.constructor.calcAverageRatings(doc.tour)
})
module.exports = mongoose.model('Review' , reviewSchema)