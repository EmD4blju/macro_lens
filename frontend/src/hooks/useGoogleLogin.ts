import { useMutation } from "@tanstack/react-query";
import { api } from '../api/axios';
import axios from "axios";
import toast from "react-hot-toast";

export interface AuthResponse {
    access_token: string;
}

export const useGoogleAuth = () => {
    const {mutate: sendTokenToBackend, isPending, isSuccess, isError, error} = useMutation({
        mutationFn: async (credential: string): Promise<AuthResponse> => {
            const response = await api.post("/auth/google", { credential });
            return response.data;
        },
        onSuccess: (data) => {
            sessionStorage.setItem("access_token", data.access_token);
            toast.success("Authentication successful!")
        },
        onError: (error) => {
            console.error("Login failed:", error)
            if (axios.isAxiosError(error)){
                const detail = error.response?.data?.detail
                toast.error(detail)
            }
        }
    });

    return {sendTokenToBackend, isPending, isSuccess, isError, error}
}