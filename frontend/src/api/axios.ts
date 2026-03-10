import axios from "axios";

interface JWTPayload { 
  sub: string,
  exp: number
}

const decodeToken = (token: string): JWTPayload => {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload));
}

export const getEmail = (): string => {
  const token = sessionStorage.getItem("access_token");
  if (!token) return "";

  const decoded_token = decodeToken(token)
  return decoded_token.sub
}


export const api = axios.create({
  baseURL: "https://macro-lens-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401){
      sessionStorage.removeItem("access_token");
      window.location.href = "/";
    }
    return Promise.reject(error)
  }
)
