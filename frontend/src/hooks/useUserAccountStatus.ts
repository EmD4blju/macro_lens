import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";

export type UserStatus = "pending" | "rejected" | "approved"
export type UserRole = "admin" | "user"

export interface UserStatusResponse {
    account_status: UserStatus
    role: UserRole
}

export const useUserStatus = (enabled: boolean) => {
    return useQuery({
        queryKey: ["user-status"],
        queryFn: async (): Promise<UserStatusResponse> => {
            const response = await api.get("/user/status");
            return response.data
        },
        enabled,
        retry: false
    })
}
