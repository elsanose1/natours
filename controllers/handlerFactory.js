const ApiFeatuers = require("../utils/apiFeatuers")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.deleteOne = Modle => catchAsync(async (req , res ,next)=>{

    const deletedItem = await Modle.findByIdAndDelete(req.params.id)

    if(!deletedItem) {
        return next(new AppError('No document Found with this ID',404))
    }
    res.status(204).json({
        status : "success",
        data : null
    }) 
})

exports.updateOne = Modle => catchAsync(async (req , res ,next)=>{
    const updatedItem = await Modle.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true,
    });

    if(!updatedItem) {
        return next(new AppError('No document Found with this ID',404))
    }
    res.status(201).json({
        status : "success",
        data : {
            updatedItem
        }
    })
})

exports.createOne = Modle => catchAsync(async (req , res , next)=>{
    const newItem = await Modle.create({...req.body})
    res.status(201).json({
        status : "success",
        data : {
            data : newItem
        }
    })
})

exports.getOne = (Modle , popOptions) => catchAsync(async (req , res ,next)=>{
    let query = Modle.findById(req.params.id)
    if (popOptions) query = query.populate('reviews')
    const item = await query
    
    if(!item) {
        return next(new AppError('No document Found with this ID',404))
    }
    res.status(200).json({
        status : "success",
        data :{
            item
        }
    })
})

exports.getAll = (Modle) => catchAsync(async (req , res ,next)=>{

    // this filter for reviews filter
    let filter ={}
    if (req.params.tourID) filter = {tour : req.params.tourID}

    const featuers = new ApiFeatuers(Modle.find(filter),req.query)
        .filter()
        .sort()
        .limitField()
        .paginate()

    const docs = await featuers.query;
    res.status(200).json({
        status : "success",
        results : docs.length,
        data : {
            docs
        }
    })

})