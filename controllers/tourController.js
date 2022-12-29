const multer = require('multer')
const sharp = require('sharp')
const Tour = require('../models/tourModle');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')
const Factory = require('./handlerFactory')


const multerStorage = multer.memoryStorage();

const multerFilter = (req ,file ,cb) =>{
    if (file.mimetype.startsWith('image')) {
         cb(null , true);
    }else{
        cb(new AppError('Not an image! please upload only image' ,400),false)
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter
});

exports.uploadTourPhoto = upload.fields([
    {name : 'imageCover', maxCount : 1},
    {name : 'images' , maxCount : 3}
])

exports.resizeTourPhoto = async (req ,res ,next)=>{
    
    if(!req.files.imageCover || !req.files.images) return next()
    
    // image Cover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${req.body.imageCover}`)
     

    // Images
    req.body.images = []
    await Promise.all(
        req.files.images.map(async (file , i) => {
        const fileName = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`public/img/tours/${fileName}`)

        req.body.images.push(fileName)
        })
    )
    


    next()
}


exports.aliasTopTours = (req , res ,next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fileds = 'name,price,ratingsAverage,summary,difficulty';
    next()
}

exports.getAllTour =  Factory.getAll(Tour)

exports.getTourById =  Factory.getOne(Tour,'reviews')

exports.createTour = Factory.createOne(Tour)

exports.updateTour  = Factory.updateOne(Tour)

exports.deleteTour =  Factory.deleteOne(Tour)

exports.getTourStats = catchAsync(async (req , res ,next) =>{

    const stats = await Tour.aggregate([
        {
            $match : { ratingsAverage : { $gte : 4.2 } },
        },
        {
            $group : {
                _id : '$difficulty',
                num : {$sum : 1},
                numRatings : {$sum : '$ratingsQuantity'},
                avgRating : {$avg : '$ratingsAverage'},
                avgPrice : {$avg : '$price'},
                minPrice : {$min : '$price'},
                maxPrice : {$max : '$price'},
            }
        },
        {
            $sort : { avgPrice : 1}
        },

    ])
    res.status(200).json({
        status : "success",
        data : {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req , res ,next) =>{
    const year = Number (req.params.year)
    const plan = await Tour.aggregate([
        {
            $unwind : '$startDates'
        },
        {
            $match : {
                startDates : {
                    $gte : new Date(`${year}-01-01`),
                    $lt : new Date(`${year+1}-01-01`)
                }
            }
        },
        {
            $group : {
                _id : {$month : "$startDates"},
                numOfTours : {$sum : 1},
                tours : {$push : '$name'}
            }
        },
        {
            $addFields : {month : '$_id'}
        },
        {
            $project : {
                _id : 0
            }
        },
        {
            $sort : { month : 1}
        }
        
    ])
    res.status(200).json({
        status : "success",
        results : plan.length,
        data : {
            plan
        }
    })

})

exports.getTourWithin = catchAsync(async (req, res, next)=>{
    //tour-within/:distance/center/:latlng/unit/:unit
    const {distance , latlng , unit} = req.params;
    const [lat , lng] = latlng.split(',')
    const radius = unit == "mi" ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng){
        return next(new AppError('Please provide valid format for latitude and longitude ex 124.54,65.488',400))
    }
    
    const tours = await Tour.find({
        startLocation : {$geoWithin : {$centerSphere : [ [lng,lat] , radius ]}}
    })

    res.status(200).json({
        status : 'success',
        results : tours.length,
        data : {
            data : tours
        }
    })

})

exports.getDistances = catchAsync(async (req, res, next) =>{
    //distances/:latlng/unit/:unit
    const { latlng , unit} = req.params;
    const [lat , lng] = latlng.split(',')
    const multiplier = unit == 'mi' ? 0.000621371192 : 0.001;

    if(!lat || !lng){
        return next(new AppError('Please provide valid format for latitude and longitude ex 124.54,65.488',400))
    }

    const tours = await Tour.aggregate([
        {
            $geoNear : {
                near : {
                    type : "point",
                    coordinates : [lng*1 , lat*1]
                },
                distanceField : 'distance',
                distanceMultiplier : multiplier  
            }
        },
        {
            $project : {
                distance : 1,
                name : 1
            }
        }
    ])

    res.status(200).json({
        status : 'success',
        data : {
            data : tours
        }
    })
})