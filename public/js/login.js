import axios from "axios";
import {showAlert} from "./showAlert";

console.log("hello")
export const login=async (email,password)=>{
  try{
    console.log(email,password)
    const res=await axios({
      method:'POST',
      url:'http://localhost:3000/api/v1/users/login',
      data:{
        email,
        password
      },
    })
    if(res.data.status==='success'){
      showAlert("success","Logged in successfully");
      window.setTimeout(()=>{
          location.assign("/");
      },500)
    }
  }catch (err){
    showAlert("error",err.response.data.message)//body of response
  }

}

export const logout=async ()=>{
  try{
    const res=await axios({
      method:'GET',
      url:'http://localhost:3000/api/v1/users/logout',
    })
    if(res.data.status==='success'){
      showAlert("success","Logged out successfully");
      location.reload(true);
    }
  }catch (err){
    showAlert("error",err.response.data.message)//body of response
  }

}
