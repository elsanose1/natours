import axios from "axios"
import { showAlert } from "./alert";

const stripe = Stripe('pk_test_51LJhMFKbmdS908tj4RVR3Qo7OTVuPGc4o9ZSkaeqzNe8W5YR5EDeoO9NsdRqtmQWa13bf7ui8OCv5gZe1NDJM3Wv00Zuwst4Dh')

export const bookTour = async tourID =>{
    try {
        const session = await axios(`/api/v1/booking/checkout-session/${tourID}`)
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (error) {
        console.log(error);
        showAlert('error' , error.response.message)        
    }
}