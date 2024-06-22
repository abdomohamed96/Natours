const mongoose=require("mongoose");
const slugify=require("slugify");
const User=require("../models/user")
const validator=require("validator");
const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"tour should have a name"],
        unique:true,
        trim:true,
        maxlength:[40,"A tour name must have less than 40 characters"],
        minlength:[10,"A tour name must have more than 10 characters"],
        // validate:[validator.isAlpha,"A tour name only contains characters"],
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,"rating must be above 1"],
        max:[5,"rating must be less than 5"],
        set:val=>Math.round(val*10)/10,
    },
    ratingsQuantity:{
        type:Number,
        default:0,
    },
    priceDiscount:{
        type:Number,
        validate:{
            //THIS WILL NOT WORK ON UPDATE-->
            message:"discount price {VALUE} should be less than price",
            validator:function (val){
                //this ==> document
                console.log(this);
                return this.price>val;

            }
        }
    },
    summary:{
        type:String,
        trim:true,
    },
    duration:{
        type:Number,
        required:[true,"tour must hava a duration"]
    },
    description:{
        type:String,
        required:[true,"tour must hava a description"],
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,"tour must hava a image cover"],
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    maxGroupSize:{
        type:Number,
        required:[true,"tour must hava a max group size"]
    },
    difficulty:{
        type:String,
        required:[true,"tour must hava a difficulty"],
        enum:{
            values:["easy","medium","difficult"],
            message:"difficulty should be easy or medium or difficult",
        }
    },
    price:{
        type:Number,
        required:[true,"tour should have price"]
    },
    startDates:[Date],
    slug:String,
    secretTour:{
        type:Boolean,
        default:false
    },startLocation:{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        //[lag,lat]
        address:String,
        description:String,
    },
    locations:[{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        //[lag,lat]
        address:String,
        description:String,
        day:Number
    }],
    guides:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }],
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
//indexes
tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:'2dsphere'});

//virtual properties
tourSchema.virtual('durationWeeks').get(function (){
    //"this" reference to current document
    //arrow function doesn't have "this" keyword
    //used for drived attruibutes
    return this.duration/7;
})
//virtual populate
// reviews:[{
//     type:mongoose.Schema.ObjectId,
//     ref:'Reviews'
// } ]virutal populate solve this issue as this array may grow OO so,virtual populate create this array without save
//to database like virtual properties
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',//this means _id in tour reference tour in reveiws
    localField:'_id'
})
//middlerwares of monogoose

//document middleware runs before save and create BUT NOT insertMany
tourSchema.pre('save',function(next){
    //"this" reference to document being save
    //should be in the schema to be stored
    //"save" called hook
    //pre save (hook or middleware)
    this.slug= slugify(this.name,{lower:true});
    next();
})
// tourSchema.pre('save',async function(next){
//     const guides=await User.find({_id:{$in:this.guides}});
//     this.guides=guides;
//     next();
// })

// Query middleware
tourSchema.pre(/^find/,function (next){
    //"this" references to the query will be excuted
    this.find({secretTour:{$ne:true}});
    this.start=Date.now();
    next();
})
tourSchema.pre(/^find/,function (next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
    })
    next();
})
tourSchema.post(/^find/,function (docs,next){
    console.log(Date.now()-this.start,"millisecends");
    next();
})

//aggregation middlewares
// tourSchema.pre('aggregate',function (next){
//     //"this" current aggregation object
//     //modify the object itself
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//     next();
// })
const Tour=mongoose.model("Tour",tourSchema);
module.exports=Tour;