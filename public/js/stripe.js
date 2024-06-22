import axios from "axios";
import {showAlert} from "./showAlert";

export const bookTour=async (tourId)=>{
   try{
       const stripe=Stripe('pk_test_51OtC07Ao841fKbo7zKB7z0xY7kkdQzv8yQrhs3QLSWiQN8dnWeUcxlvIAGFFSRXaXSk2Xlsk9Vn6UVzf2KJecU5o00EmjbtCZa')
       const session=await axios(
           `/api/v1/bookings/checkout-session/${tourId}`
       );
       await stripe.redirectToCheckout({
           sessionId:session.data.session.id
       });
   }catch (err){
       showAlert('error',err.message);
   }
}