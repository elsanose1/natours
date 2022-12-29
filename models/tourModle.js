const mongoose = require('mongoose');
const validator = require('validator')
const slugify = require('slugify')

// const User = require('./userModle')

const tourSchema = mongoose.Schema({
    name : {
      type : String,
      required : [true , "A Tour must have a name"],
      trim : true,
      unique : true,
      maxlength : [40 , "A Tour name must have less or equal 40 characters"],
      minlength : [10 , "A Tour name must have more or equal 10 characters"],
      // validate : [validator.isAlpha , 'Tour name must only conatins Characters']
    },
    duration:{
        type : Number,
        required : [true , "A tour must have a durations"]
    },
    maxGroupSize : {
        type : Number,
        required : [true , "A tour must have a group size"]
          
    },
    difficulty: {
        type : String,
        required : [true , "A tour must have a difficullty"],
        enum : {
          values : ['easy' , 'medium' , 'difficult'],
          message : "You can only choose from ['easy' , 'medium' , 'difficult']"
        }
    },
    ratingsAverage : {
      type : Number,
      default : 4.5,
      min : [1 , "rating must be above 1.0"],
      max : [5 , "rating must be below 5.0"],
      set : val => Math.round(val * 10) /10
    },
    ratingsQuantity:{
        type : Number,
        default : 0
    },
    price : {
      type : Number,
      required : [true , "A Tour must have a price"]
    },
    priceDiscount : {
      type : Number,
      validate : {
        validator : function (val){
          // "this" keyword only points to current doc on New document creation
          return val < this.price
        },
        message : "Discount ({VALUE}) must be below Tour Price"
      }
    },
    summary : {
        type : String,
        trim : true,
        required : [true , "A Tour must have a summary"]
    },
    description : {
        type : String,
        trim : true
    },
    imageCover : {
        type : String,
        required : [true , "A Tour must have a image cover"]
    },
    images : [String],
    startDates : [Date],
    slug : String,
    secretTour : {
      type : Boolean,
      default : false,
    },
    startLocation :{
      // GeoJson 
      type : {
        type : String,
        default : 'Point',
        enum : ['Point']
      },
      coordinates : [Number],
      address : String,
      description : String
    },
    locations : [
      {
        type : {
          type : String,
          default : 'Point',
          enum : ['Point']
        },
        coordinates : [Number],
        address : String,
        description : String,
        day : Number
      }
    ],
    guides : [
      {
        type : mongoose.Schema.ObjectId,
        ref : 'User'
      }
    ],
  },
  {
    timestamps: true,
    toJSON : {virtuals : true},
    toObject : {virtuals  : true},
  }
)

tourSchema.index({price : 1 , ratingsAverage : -1})
tourSchema.index({slug : 1})
tourSchema.index({startLocation : '2dsphere'})

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

tourSchema.virtual('reviews' , {
  ref : 'Review',
  foreignField : 'tour',
  localField : '_id'
})

// DOCUMENT MIDDLEWARE  : run before .save() || .create()
tourSchema.pre('save', function(next){
  this.slug = slugify(this.name,{lower : true ,});
  next();
})




// tourSchema.post('save' , function(doc , next) {
//   console.log(doc);
//   next()
// })

//QUERY MIDDLEWARE 

// tourSchema.pre("find" , function (next) {
tourSchema.pre(/^find/ , function (next) {
  this.find({ secretTour : {$ne : true}})
  next();
})


tourSchema.pre(/^find/ , function (next) {
  this.populate({
    path : 'guides',
    select : '-__v -passwordChangedAt'
  })
  next();
})



// AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate' , function (next){
//   this.pipeline().unshift({'$match' : { secretTour : {$ne : true} }})
//   console.log(this.pipeline());
//   next();
// })

const Tour = mongoose.model('Tour' , tourSchema)

module.exports = Tour