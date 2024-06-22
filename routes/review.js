const reviewController=require("../controllers/review");
const bookingController=require("../controllers/booking");
const express = require('express');
const auth=require("../controllers/authController");
const router=express.Router({mergeParams:true});

router.use(auth.protect);
router.route("/")
    .get(reviewController.getAllReviews)
    .post(auth.restrictTo('user'),bookingController.isBooked,reviewController.setTourAndUserId,reviewController.createReview);

router.route("/:id")
    .get(reviewController.getOneReview)
    .delete(auth.restrictTo('admin','user'),reviewController.deleteReview)
    .patch(auth.restrictTo('admin','user'),reviewController.updateReview)
module.exports=router;