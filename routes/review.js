const reviewController=require("../controllers/review")
const express = require('express');
const auth=require("../controllers/authController");
const router=express.Router({mergeParams:true});

// POST /tour/2232/reviews
router.use(auth.protect);
router.route("/")
    .get(reviewController.getAllReviews)
    .post(auth.restrictTo('user'),reviewController.setTourAndUserId,reviewController.createReview);

router.route("/:id")
    .get(reviewController.getOneReview)
    .delete(auth.restrictTo('admin','user'),reviewController.deleteReview)
    .patch(auth.restrictTo('admin','user'),reviewController.updateReview)
module.exports=router;