import axios from 'axios';
const token = localStorage.getItem('token');

export default axios.create({
    // CHANGE THE BASE URL TO TEST IN LOCAL ENVIRONMENT
    baseURL: "https://uthere-l4pyduarua-uc.a.run.app/api/",
    headers: {
        'Accept':'application/json',
        Authorization: `Token ${token}`,
        'Content-Type':'application/json',
    }
});