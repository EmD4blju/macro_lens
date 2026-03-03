import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../api/axios";

export type UserStatus = "pending" | "rejected" | "approved"
export type UserRole = "admin" | "user"

export interface UserStatusResponse {
    account_status: UserStatus
    role: UserRole
}

export interface AdminUser {
    id: number;
    email: string;
    role: UserRole;
    account_status: UserStatus
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

export const useGetUsers = () => {
    return useQuery({
        queryKey: ["admin-users"],
        queryFn: async (): Promise<AdminUser[]> => {
            const response = await api.get("/admin/users");
            return response.data;
        },
        retry: false
    })
}

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, status }: { userId: number; status: UserStatus }) => {
            const response = await api.patch(`/admin/users/${userId}/status?status=${status}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        }
    })
}
