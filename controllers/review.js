const Review=require("../models/review");
const Booking=require("../models/booking");
const AppError=require("../utils/appError");
const catchAsync=require("../utils/catchAsync");
const {deleteFactory, updateFactory, createFactory, getOneFactory, getAllFactory} = require("./handlerFactory");
exports.setTourAndUserId=(req,res,next)=>{
    req.body.user=req.body.user||req.user._id;
    req.body.tour=req.body.tour||req.params.tourId
    next();
}

exports.getAllReviews=getAllFactory(Review);
exports.deleteReview=deleteFactory(Review);
exports.updateReview=updateFactory(Review);
exports.createReview=createFactory(Review);
exports.getOneReview=getOneFactory(Review);