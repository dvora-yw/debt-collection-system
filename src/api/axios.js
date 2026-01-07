import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,

    "Content-Type": "application/json",
  },
});

export default api;
