import axios from "axios";
import { notifyError } from "../components/ToastUtils";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("⏱️ Request timed out");
      notifyError("⏱️ Request timed out");
    } else if (!error.response) {
      console.error("🌐 Network error: check internet or server");
    } else {
      const status = error.response.status;
      switch (status) {
        case 400:
          console.warn("🔴 Bad Request: check your input");
          break;
        case 401:
          console.warn("🔒 Unauthorized: maybe expired login");
          break;
        case 403:
          console.warn("🚫 Forbidden: you lack permissions");
          break;
        case 404:
          console.warn("🔍 Not Found: bad API endpoint");
          break;
        case 500:
          console.warn("🔥 Server Error: try again later");
          break;
        default:
          console.warn(`⚠️ Unhandled status: ${status}`);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
