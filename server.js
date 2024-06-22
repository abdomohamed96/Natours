process.on('uncaughtException',err=>{
    console.log("ERROR 🔥: ",err)
    process.exit(1);
});
const app=require("./app");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path:"./config.env"})

const server=app.listen(process.env.PORT,"127.0.0.1",async ()=>{
    console.log(`the server is running at ${process.env.PORT}`);
    await mongoose.connect(process.env.CONNECTION_STRING,{
        useCreateIndex:true,
        useNewUrlParser:true,
        useFindAndModify:false
    })
    console.log("connected successfully to database")
});
process.on('unhandledRejection',err=>{
        console.log("ERROR 🔥: ",err.name,err.message)
        console.log("Shutting down ...");
        // process.exit(1);//will abort all running reqeusts
        server.close(()=>{
            process.exit(1);
        })
    }
);

