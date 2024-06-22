const sharp=require("sharp");
const User=require("../models/user");
const AppError=require("../utils/appError");
const catchAsync=require("../utils/catchAsync");
const {deleteFactory, updateFactory, getOneFactory, getAllFactory} = require("./handlerFactory");
const multer=require('multer');
// const multerStorage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'public/img/users')
//     },
//     filename:(req,file,cb)=>{
//         const ext=file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
// }
// })
const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError('Not an image! Please upload only images',400),false);
    }
}
exports.resizeUserPhoto=async (req,res,next)=>{
    if(!req.file) return next();
    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`);

    next();
}
const multerStorage=multer.memoryStorage();
const upload=multer({
    storage:multerStorage,
    fileFilter:multerFilter,
})
exports.uploadUserPhoto=upload.single('photo')//name of the field in form-data 'single'=>only one field and one photo
const filterObj=(obj,...allowedFields)=>{
    let newObj={}
    Object.keys(obj).forEach((key)=>{
        if(allowedFields.includes(key)){
            newObj[key]=obj[key];
        }
    })
    return newObj
}

exports.updateMe=catchAsync(async (req,res,next)=>{
    if(req.body.password|| req.body.passwordConfirm){
        return next(new AppError("This route is not for password update please visit /updatePassword",400))
    }
    const filteredBody=filterObj(req.body,'name','email')
    if(req.file) filteredBody.photo=req.file.filename;
    console.log(filteredBody);
    const updatedUser=await User.findByIdAndUpdate(req.user._id,filteredBody,{
        new:true,
        runValidator:true
    })
    res.status(200).json({
        status:"success",
        data:{
            user:updatedUser
        }
    })
})

exports.deleteMe=catchAsync(async (req,res,next)=>{
    const deleted=await User.findByIdAndUpdate(req.user._id,{active:false},{
        new:true,
        runValidator:true
    })
    res.status(204).json({
        status:"success",
        data:null
    })
})
exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id;
  next()
}
exports.deleteUser=deleteFactory(User);
exports.updateUser=updateFactory(User);
exports.getUser=getOneFactory(User);
exports.getAllUsers=getAllFactory(User);
