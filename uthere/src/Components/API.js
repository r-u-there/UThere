import axios from 'axios';
const token = localStorage.getItem('token');
import { getCSRFToken } from './utils';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const csrfToken = getCSRFToken();
export default axios.create({
    // CHANGE THE BASE URL TO TEST IN LOCAL ENVIRONMENT
    // BaseURL: "http://127.0.0.1:8000/api/"
    baseURL: "https://uthere-l4pyduarua-uc.a.run.app/api/",
    headers: {
        'Accept':'application/json',
        Authorization: `Token ${token}`,
        'Content-Type':'application/json',
        'X-CSRFToken': csrfToken,

    }
});