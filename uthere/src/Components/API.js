import axios from 'axios';
const token = localStorage.getItem('token');
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export default axios.create({
    // CHANGE THE BASE URL TO TEST IN LOCAL ENVIRONMENT
    baseURL: "http://127.0.0.1:8000/api/",
    // baseURL: "https://uthere-l4pyduarua-uc.a.run.app/api/",
    headers: {
        'Accept':'application/json',
        'Content-Type':'application/json',
    }
});