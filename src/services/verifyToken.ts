import apiClient from "./apiClient";
export const verifyToken = async () => {
  try {
    const response = await apiClient.get("/auth/verify-jwt");
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
