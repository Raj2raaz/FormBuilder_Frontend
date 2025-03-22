import axios from "axios";

const API = axios.create({
    // baseURL: "http://localhost:5000/api/forms",
    baseURL: "https://formbuilder-backend-7g5u.onrender.com/api/forms",
    headers: { "Content-Type": "application/json" }
});

export default API;
