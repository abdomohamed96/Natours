const Tour=require("../models/tour")
const APIFeature=require("../utils/APIFeature")
const catchAsync=require("../utils/catchAsync")
const AppError=require("../utils/appError")
const {deleteFactory, createFactory, updateFactory, getOneFactory, getAllFactory} = require("./handlerFactory");
const sharp=require("sharp");
const multer=require('multer');
const multerStorage=multer.memoryStorage();

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError('Not an image! Please upload only images',400),false);
    }
}
const upload=multer({
    storage:multerStorage,
    fileFilter:multerFilter,
})
//upload.array('images',5) for more than image with same name(req.files)
exports.uploadTourPhotos=upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3},
])

exports.resizeTourPhotos=async (req,res,next)=>{
    if(!req.files.images||!req.files.imageCover) return next();
    //1) ImageCover
    req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${req.body.imageCover}`);

    //2) images
    req.body.images=[];
    await Promise.all(
        req.files.images.map(async (img,i)=>{
            const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
            await sharp(img.buffer)
                .resize(2000,1333)
                .toFormat('jpeg')
                .jpeg({quality:90})
                .toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename);
        })
    )
    next();
}

exports.aliasTopTours=catchAsync(async (req,res,next)=>{
    req.query.sort="-ratingsAverage,price"
    req.query.limit="5";
    req.query.fields="name,price,ratingsAverage,summary,difficulty";
    next();
})

exports.getAllTours=getAllFactory(Tour)
exports.getTour=getOneFactory(Tour,{path:'reviews'})
exports.updateTour=updateFactory(Tour);
exports.deleteTour=deleteFactory(Tour);
exports.createTour=createFactory(Tour);

exports.getTourStat=catchAsync( async (req,res,next)=>{
    const stats=await Tour.aggregate([
        {
          $match:{ratingsAverage:{$gte:4.5}}
        },{
            $group:{
                _id:{$toUpper:'$difficulty'},
                avgRating:{$avg:'$ratingsAverage'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'},
                numOfRatings:{$sum:"$ratingsAverage"},
                numOfTours:{$sum:1},
            }
        },
        {
            $sort:{avgPrice:1}
        }
    ]);
    res.status(200).json({
        status:"success",
        data:{
            stats
        }
    })
})
exports.getTourWithin=catchAsync(async (req,res,next)=>{
    const {unit,latlng,distance}=req.params;
    const [lat,lng]=latlng.split(",");
    const radius=unit==='mi'?distance/3963.2 :distance/6378.1;
    if(!lat||!lng){
        return next(new AppError('Please provide latitude and longitude in format lat,lng',400));
    }
    const tours=await Tour.find({startLocation:{
        $geoWithin:{
            $centerSphere:[[lng,lat],radius],
        }
        }});
    res.status(200).json({
        status:"success",
        results:tours.length,
        data:{
            tours
        }
    })
})
exports.getDistances=catchAsync(async (req,res,next)=>{
    const {unit,latlng,distance}=req.params;
    const [lat,lng]=latlng.split(",");
    const mutiplier=unit==='mi'? 0.000621371192:0.001;
    if(!lat||!lng){
        return next(new AppError('Please provide latitude and longitude in format lat,lng',400));
    }
    const distances=await Tour.aggregate([
        {
            //must be the first stage
            //geoNear require at least one fields contains geodpatial index
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[lng*1,lat*1]
                },
                distanceField:'distance',
                distanceMultiplier:mutiplier
            }
        },{
        $project:{
            name:1,
            distance:1
        }
        }

    ]);
    res.status(200).json({
        status:"success",
        data:{
            distances
        }
    })
})
exports.getMonthlyPlan=catchAsync( async (req,res,next)=>{
    const year= req.params.year*1;
    const plan=await Tour.aggregate([
        {
            $unwind:'$startDates'
        },{
            $match:{
                startDates:{
                    $gte:new Date(`${year}-0-0`),
                    $lte:new Date(`${year}-12-31`),
                }
            },
        },{
            $group:{
                _id:{$month:'$startDates'},
                numOfTours:{$sum:1},
                tours:{$push:'$name'}
            }
        },{
            $addFields:{month:'$_id'}
        },{
            $project:{
                _id:0,
            }
        },{
         $sort:{numOfTours:-1}
        },{
            $limit:6
        }
    ])
    res.status(200).json({
        status:"success",
        data:{
            plan
        }
    })
})