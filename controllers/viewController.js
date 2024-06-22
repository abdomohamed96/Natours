const Tour=require('../models/tour');
const User=require('../models/user');
const Booking=require('../models/booking');
const AppError=require('../utils/appError')
const catchAsync=require('../utils/catchAsync');
exports.getTourPage=catchAsync(async (req,res,next)=>{
    const tour=await Tour.findOne({slug:req.params.slug})
        .populate({
            path:'reviews',
            fields:'review rating user'
        });
    if(!tour){
        return next(new AppError('There is no tour with that name',404));
    }
    res.status(200).render('tour',{
        title:tour.name,
        tour
    })
})
exports.getOverviewPage=catchAsync(async (req,res,next)=>{
    //get all tour
    const tours=await Tour.find();
    // console.log(tours[0].imageCover)
    res.status(200).render('overview',{
        title:'All tours',
        tours
    })
})
exports.login=catchAsync(async (req,res,next)=>{
    const tours=await Tour.find();
    // console.log(tours[0].imageCover)
    res.status(200)
        .render('login',{
        title:'login',
        tours
    })
})

exports.signup=catchAsync(async (req,res,next)=>{
    res.status(200)
        .render('signup',{
            title:'signup'
        })
})
exports.getAccount=catchAsync(async (req,res,next)=>{
    res.status(200)
        .render('account',{
            title:'me',
        })
})
exports.getMyTours=catchAsync(async (req,res,next)=>{
    const bookings=await Booking.find({user:req.user.id});
    console.log(bookings);
    const tourIDs=bookings.map(el=>el.tour.id);
    console.log(tourIDs);
    const tours=await Tour.find({_id:{$in:tourIDs}})
    res.status(200)
        .render('overview',{
            title:'My tours',
            tours
        })
})