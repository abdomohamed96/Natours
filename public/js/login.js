import axios from "axios";
import {showAlert} from "./showAlert";


export const login=async (email,password)=>{
  try{
    const res=await axios({
      method:'POST',
      url:'/api/v1/users/login',
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
      url:'/api/v1/users/logout',
    })
    if(res.data.status==='success'){
      showAlert("success","Logged out successfully");
      location.reload(true);
    }
  }catch (err){
    showAlert("error",err.response.data.message)//body of response
  }

}

export const signup=async (email,password,name,passwordConfirm)=>{
  try{
    const res=await axios({
      method:'POST',
      url:'/api/v1/users/signup',
      data:{
        email,
        password,
        name,
        passwordConfirm
      },
    })
    if(res.data.status==='success'){
      showAlert("success","Sign up successfully");
      window.setTimeout(()=>{
        location.assign("/me");
      },500)
    }
  }catch (err){
    showAlert("error",err.response.data.message)//body of response
  }

}