const tourController=require("../controllers/tour")
const express = require('express');
const auth=require("../controllers/authController");
const reviewRouter=require("./../routes/review")
const router=express.Router();

router.use("/:tourId/reviews",reviewRouter);

router.route("/top-5-cheap")
    .get(tourController.aliasTopTours,tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStat);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getTourWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route("/monthly-plan/:year").get(auth.protect,auth.restrictTo('admin','lead-guide','guide')
    ,tourController.getMonthlyPlan);

router.route("/")
    .get(tourController.getAllTours)
    .post(auth.protect,auth.restrictTo('admin','lead-guide'),tourController.createTour);

router.route("/:id")
    .get(tourController.getTour)
    .delete(auth.protect,
        auth.restrictTo('admin','lead-guide'),
        tourController.deleteTour)
    .patch(auth.protect,auth.restrictTo('admin','lead-guide'),
        tourController.uploadTourPhotos,
        tourController.resizeTourPhotos,
        tourController.updateTour);

module.exports=router;