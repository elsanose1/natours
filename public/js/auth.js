import '@babel/polyfill'
import axios from 'axios'
import { showAlert } from './alert'

export const login = async (email , password) =>{
    try {
        const res = await axios({
            method : 'POST',
            url : '/api/v1/users/login',
            data: {
                email,
                password
            }
        })
    
        if(res.data.status ==='success'){
            showAlert('success' ,'Logged in successfully!')
            window.setTimeout( ()=>{
                location.assign('/')
            },1500)
        }
    } catch (err) {
        showAlert('error' ,err.response.data.message)
    }
}


export const register = async (name ,email , password, confirmPassword) =>{

    try {
        const res = await axios({
            method : 'POST',
            url : '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                confirmPassword
            }
        })
    
        if(res.data.status ==='success'){
            showAlert('success' ,'Account created successfully!')
            window.setTimeout( ()=>{
                location.assign('/')
            },1500)
        }
    } catch (err) {
        showAlert('error' ,err.response.data.message)
    }
}
export const logout = async ()=>{
    try {
        const res = await axios({
            method : 'GET',
            url : '/api/v1/users/logout',
        })

        if(res.data.status ==='success'){
            showAlert('success' ,'Logged out successfully!')
            window.setTimeout( ()=>{
                location.assign('/')
            },1500)
        }
    } catch (err) {
        showAlert('error' ,err.response.data.message)
        
    }
}

export const resetPassword = async (email)=>{
    try {
        const res = await axios.post('/api/v1/users/forgotpassword',{email});
        
        showAlert('success' , res.data.message)

    } catch (error) {
        console.log(error);
        showAlert('error' , "There's no user with this email")

    }

}


