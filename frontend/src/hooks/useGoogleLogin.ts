import { useMutation } from "@tanstack/react-query";
import { api } from '../api/axios';

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
            localStorage.setItem("access_token", data.access_token);
        },
        onError: (error) => {
            console.error("Login failed:", error)
        }
    });

    return {sendTokenToBackend, isPending, isSuccess, isError, error}
}