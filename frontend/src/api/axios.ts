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
  const token = localStorage.getItem("access_token");
  if (!token) return "";

  const decoded_token = decodeToken(token)
  return decoded_token.sub
}


export const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});
