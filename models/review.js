const mongoose=require("mongoose")
const Tour=require("../models/tour");
const reviewSchema=mongoose.Schema({
    review:{
        type:String,
        require:[true,'Review should have review field'],
    },
    rating:{
        type:Number,
        required:[true,'Review should have rating field'],
        min:[1,'Min rating is 1'],
        max:[5,'Max rating is 5']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,"Review must belong to user."],
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,"Review must belong to tour."],
    },
    },{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
)
reviewSchema.pre(/^find/,function(){
    this.populate({
        path:'user',
        select:'name photo'
    });
})
reviewSchema.statics.calcAverageRatings =async function (tourId){
    const stats=await this.aggregate([
        {
            $match:{tour:tourId},
        },
        {
            $group:{
                _id:tourId,
                nRatings:{$sum:1},
                avgRating: {$avg:'$rating'}
            }
        }

    ])
    let tour;
    if(stats.length>0){
        tour=await Tour.findByIdAndUpdate(tourId,
            {ratingsAverage:stats[0].avgRating,
                ratingsQuantity:stats[0].nRatings,},{
                new:true
            })
    }else{
        tour=await Tour.findByIdAndUpdate(tourId,
            {ratingsAverage:4.5,
                ratingsQuantity:0},{
                new:true
            })
    }
    console.log(stats)

}
reviewSchema.index({tour:1,user:1},{unique:true});
reviewSchema.post('save',async function (){
    await this.constructor.calcAverageRatings(this.tour);
})

reviewSchema.pre(/^findOneAnd/,async function (){
    this.r=await this.findOne();
})

reviewSchema.post(/^findOneAnd/,async function (){
    await this.r.constructor.calcAverageRatings(this.r.tour);
})


const Review=mongoose.model('Review',reviewSchema);
module.exports=Review;
