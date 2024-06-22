const express = require('express');
const router = express.Router();
const auth=require("../controllers/authController")
const {forgotPassword} = require("../controllers/authController");
const {updateMe, deleteMe, deleteUser, updateUser,getUser, getAllUsers, getMe, uploadUserPhoto, resizeUserPhoto} = require("../controllers/userController");
const bookingRouter=require("./booking")
/* GET users listing. */
router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.get('/logout', auth.logout);
router.post('/forgotPassword', auth.forgotPassword);
router.patch('/resetPassword/:resetToken', auth.resetPassword);

router.use(auth.protect);
router.patch('/updatePassword',auth.udatePassword);
router.patch("/updateMe",uploadUserPhoto,resizeUserPhoto,updateMe)
router.patch("/deleteMe",deleteMe)
router.get("/me",getMe,getUser);

router.use(auth.restrictTo('admin'));
router.route("/:id").delete(deleteUser).patch(updateUser).get(getUser);
router.route('/').get(getAllUsers);
router.use('/:userId/bookings',bookingRouter);

module.exports = router;
