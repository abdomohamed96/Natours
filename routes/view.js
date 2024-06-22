const express = require('express');
const viewController=require("../controllers/viewController");
const { isLoggedIn, protect} = require("../controllers/authController");
const {getCheckoutSession, createBookingCheckout} = require("../controllers/booking");
const router=express.Router();

router.route('/').get(createBookingCheckout,isLoggedIn,viewController.getOverviewPage);
router.route('/tours/:slug').get(isLoggedIn,viewController.getTourPage);
router.route('/login').get(isLoggedIn,viewController.login);
router.route('/signup').get(isLoggedIn,viewController.signup);
router.route('/me').get(protect,viewController.getAccount);
router.route('/my-tours').get(protect,viewController.getMyTours);
module.exports=router;