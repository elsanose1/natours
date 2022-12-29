import axios from "axios"
import { showAlert } from "./alert"

// type is either password or data
export const updateSettings = async (type,data) =>{
    let url = type === 'password' ? 'updatePassword' : 'updateme';
    try {
        
        const res = await axios({
            method : 'PATCH',
            url : `http://127.0.0.1:8000/api/v1/users/${url}`,
            data
        })
        if (res.data.status === 'success'){
            showAlert('success' ,`${type.toUpperCase()} updated successfully`)
            window.setTimeout( ()=>{
                location.reload(true)
            },1500)
        }
    } catch (error) {
        showAlert('error' ,error.response.data.message)
        console.log(error);

    }
}