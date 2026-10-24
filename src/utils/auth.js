export const saveToken = (token) => localStorage.setItem("user_token", token);
export const getToken = () => localStorage.getItem("user_token");
export const clearToken = () => localStorage.removeItem("user_token");
