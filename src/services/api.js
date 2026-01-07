import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
});

// הוספת interceptor שמוסיף את ה-token לכל בקשה
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // הנחה: ה-token נמצא ב-userData.token או userData.accessToken
      const token = userData.token || userData.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor לטיפול בשגיאות authentication (אופציונלי)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // רק אם יש 401 ויש user (כלומר אמורים להיות מחוברים אבל ה-token פג תוקף)
    if (error.response?.status === 401 && localStorage.getItem('user')) {
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;