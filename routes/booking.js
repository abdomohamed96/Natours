const bookingController=require("../controllers/booking")
const express = require('express');
const auth=require("../controllers/authController");
const router=express.Router({mergeParams:true});

router.use(auth.protect);
router.get('/checkout-session/:tourId',bookingController.getCheckoutSession);

router.use(auth.restrictTo('admin','lead-guide'));
router.route("/")
    .get(bookingController.getAllBookings)
    .post(bookingController.isSoldOut,bookingController.createBooking);

router.route("/:id")
.get(bookingController.getOneBooking)
.delete(bookingController.deleteBooking)
.patch(bookingController.updateBooking)

module.exports=router;