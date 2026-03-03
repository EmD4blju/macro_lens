import { getEmail } from "../api/axios";
import { useGetUsers, useUpdateUserStatus } from "../hooks/useUser";

interface UsersOverlayProps {
    onClose: () => void;
}

export const UsersOverlay = ({ onClose }: UsersOverlayProps) => {
    const { data: users, isLoading } = useGetUsers();
    const { mutate: updateStatus, isPending } = useUpdateUserStatus();
    const adminEmail = getEmail();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl flex flex-col gap-4">
                
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-100">User Management</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="flex gap-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                        {users?.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-100">{user.email}</span>
                                    <span className={`text-xs ${
                                        user.account_status === "approved" ? "text-emerald-400" :
                                        user.account_status === "pending" ? "text-yellow-400" :
                                        "text-red-400"
                                    }`}>
                                        {user.account_status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {user.email === adminEmail ? (
                                        <span className="text-xs text-slate-500 italic">you</span>
                                    ) : (
                                        <>
                                            {user.account_status !== "approved" && (
                                                <button
                                                    onClick={() => updateStatus({ userId: user.id, status: "approved" })}
                                                    disabled={isPending}
                                                    className="px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {user.account_status !== "rejected" && (
                                                <button
                                                    onClick={() => updateStatus({ userId: user.id, status: "rejected" })}
                                                    disabled={isPending}
                                                    className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}