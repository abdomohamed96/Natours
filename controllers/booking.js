const Booking=require("../models/booking");
const dotenv=require("dotenv");
dotenv.config({path:"./config.env"})
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour=require("../models/tour");
const AppError=require("../utils/appError");
const catchAsync=require("../utils/catchAsync");
const {deleteFactory, updateFactory, createFactory, getOneFactory, getAllFactory} = require("./handlerFactory");
exports.getCheckoutSession=catchAsync(async (req,res,next)=>{
    const tour=await Tour.findById(req.params.tourId);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment', // Add this line to specify the mode
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                    unit_amount: tour.price * 100,
                },
                quantity: 1
            }
        ],
    });

    res.status(200).json({
        session,
        status:"success"
    })
})
exports.getAllBookings=getAllFactory(Booking);
exports.deleteBooking=deleteFactory(Booking);
exports.updateBooking=updateFactory(Booking);
exports.createBooking=createFactory(Booking);
exports.getOneBooking=getOneFactory(Booking);

exports.createBookingCheckout=catchAsync(async (req,res,next)=>{
    const {tour,user,price}=req.query;
    if(!tour&&!user&&!price) return next();
    await Booking.create({tour,user,price});
    res.redirect(req.originalUrl.split('?')[0]);
})
exports.isBooked=catchAsync(async (req,res,next)=>{
    // get booking of user that has tourId
    const booking=await Booking.findOne({user:req.user.id,tour:req.params.tourId});
    if(!booking){
        return next(new AppError('You are allowed to review booked tours only',400));
    }
    next();
})
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function isSameDate(date1, date2) {
    console.log(formatDate(date1))
    return formatDate(date1) === formatDate(date2);
}
exports.isSoldOut=catchAsync(async (req,res,next)=>{
    req.body.tour=req.body.tour||req.params.tourId;
    const tour=await Tour.findById(req.body.tour);
    if(!tour){
        return next(new AppError('This tour is not exists. Please find another one ',400));
    }
    const tourInstanace=tour.startDates.find(el=>isSameDate(el.date,req.body.date))
    if(!tourInstanace||tourInstanace.soldOut){
        return next(new AppError('This date is not exists or sold out,Please choose another date ',400));
    }
    tourInstanace.participation+=1
    if(tourInstanace.participation>=tour.maxGroupSize){
        tourInstanace.soldOut=true;
    }
    const newT=await tour.save();
   next();
})