import '@babel/polyfill'
import {login, logout} from "./login";
import {updateSetting} from "./updateSetting";
import {bookTour} from "./stripe"
import {displayMap} from "./mapbox";

const logoutButton=document.querySelector('.nav__el--logout')
const loginForm=document.querySelector('.form--login');
const userDataForm=document.querySelector('.form-user-data');
const userPasswordForm=document.querySelector('.form-user-settings');
const bookBtn=document.getElementById('book-tour');
const mapBox=document.getElementById('map');
if(mapBox){
    const locations=JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await login(email, password);
    })
}
if(userDataForm){
    userDataForm.addEventListener('submit',async e=>{
        e.preventDefault();
        const form =new FormData();
        form.append('name',document.getElementById('name').value);
        form.append('photo',document.getElementById('photo').files[0]);
        form.append('email',document.getElementById('email').value);
        await updateSetting(form,'data');
    })
}
if(userPasswordForm){
    userPasswordForm.addEventListener('submit',async e=>{
        e.preventDefault();
        const savePasswordButton=document.querySelector('.btn--save-password');
        savePasswordButton.textContent='Updating...'
        const passwordConfirm = document.getElementById('password-confirm').value;
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        await updateSetting({password,passwordCurrent,passwordConfirm},'password');
        savePasswordButton.textContent='SAVE PASSWORD';
        document.getElementById('password-confirm').textContent='';
        document.getElementById('password-current').textContent='';
        document.getElementById('password').textContent='';
    })
}
if(logoutButton){
    logoutButton.addEventListener('click',logout)
}
if(bookBtn){
    bookBtn.addEventListener('click',e=>{
        e.target.textContent='Processing...';
        const {tourId}=e.target.dataset
        console.log(tourId)
        bookTour(tourId);
    })
}
