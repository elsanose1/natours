import { login , logout, register } from "./auth";
import { updateSettings } from "./account";
import { displayMap } from "./mapBox";
import { bookTour } from "./stripe";

// DOM ELEMENTS
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('#loginForm')
const registerForm = document.querySelector('#registerForm')
const settingForm = document.querySelector('#settingForm')
const passwordForm = document.querySelector('#passwordForm')
const logoutBtn = document.querySelector('.nav__el--logout')
const bookTourBtn = document.querySelector('#bookTour')

// VALUES

// DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations)
    
}


// login Form
if (loginForm) {
    loginForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        document.querySelector('#loginBtn').textContent = 'Loading'
        document.querySelector('#loginBtn').disabled  = true
        try {
            await login(email , password)
        } catch (error) {
            console.log(error);
        }
        document.querySelector('#loginBtn').textContent = 'Login'
        document.querySelector('#loginBtn').disabled  = false
    })
}

// register form
if (registerForm) {
    registerForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        document.querySelector('#registerBtn').textContent = 'Loading'
        document.querySelector('#registerBtn').disabled  = true
        try {
            
            await register(name ,email , password ,confirmPassword)
        } catch (error) {
            console.log(error);
        }
        document.querySelector('#registerBtn').textContent = 'Sign up'
        document.querySelector('#registerBtn').disabled  = false
    })
}

// data form
if (settingForm) {
    settingForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const form = new FormData();

        form.append('name' ,document.getElementById('name').value )
        form.append('email' ,document.getElementById('email').value )
        form.append('photo' ,document.getElementById('photo').files[0])
        
        console.log(form);

        document.querySelector('#saveSettingsBtn').textContent = 'Updating Data'
        document.querySelector('#saveSettingsBtn').disabled  = true
        await updateSettings('data', form)
        document.querySelector('#saveSettingsBtn').textContent = 'Save settings'
        document.querySelector('#saveSettingsBtn').disabled  = false

    })
}

// change password form
if (passwordForm){
    passwordForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const oldPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        document.querySelector('#savePasswordBtn').textContent = 'Updating Password'
        document.querySelector('#savePasswordBtn').disabled  = true
        await updateSettings('password', {oldPassword , newPassword, confirmPassword})
        document.querySelector('#savePasswordBtn').textContent = 'Save password'
        document.querySelector('#savePasswordBtn').disabled  = false
    })
}

// logout
if(logoutBtn){
    logoutBtn.addEventListener('click' , logout)
}

// book tour 

if(bookTourBtn){
    bookTourBtn.addEventListener('click' , async (e)=>{
        e.target.textContent = 'Processing...';
        e.target.disabled = true
        await bookTour(e.target.dataset.tourid)
        e.target.textContent = 'Book tour now!';
        e.target.disabled = false


    })
}