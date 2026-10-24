import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUserRole, toggleBanUser } from "../../../services/admin.api";
import { useSelector } from "react-redux";
import { Trash2, Shield, ShieldOff, Ban, Unlock, MoreVertical, Users } from "lucide-react";
import TableSkeleton from "../../../components/Loaders/TableSkeleton";
import CardListSkeleton from "../../../components/Loaders/CardListSkeleton";

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [showActions, setShowActions] = useState(null);

    const { user } = useSelector((state) => state.auth);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const { getMe } = await import("../../../services/auth.api");
                const res = await getMe();
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Failed to load current user:", err);
            }
        };
        loadCurrentUser();
    }, []);

    const fetchUsers = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            setError(null);
            const res = await getAllUsers();
            setUsers(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!showActions) return;

        const handleClickOutside = (event) => {
            const dropdown = event.target.closest('.user-dropdown-container');
            if (!dropdown) {
                setShowActions(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showActions]);

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setActionLoading(userId);
            setError(null);
            await deleteUser(userId);
            setSuccess(`User "${userName}" deleted successfully`);
            await fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete user");
        } finally {
            setActionLoading(null);
            setShowActions(null);
        }
    };

    const handleMakeAdmin = async (userId, userName) => {
        if (!window.confirm(`Make "${userName}" an admin?`)) {
            return;
        }

        try {
            setActionLoading(userId);
            setError(null);
            await updateUserRole(userId, "admin");
            setSuccess(`"${userName}" is now an admin`);
            await fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update user role");
        } finally {
            setActionLoading(null);
            setShowActions(null);
        }
    };

    const handleMakeStudent = async (userId, userName) => {
        if (!window.confirm(`Remove admin privileges from "${userName}"?`)) {
            return;
        }

        try {
            setActionLoading(userId);
            setError(null);
            await updateUserRole(userId, "student");
            setSuccess(`"${userName}" is now a student`);
            await fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update user role");
        } finally {
            setActionLoading(null);
            setShowActions(null);
        }
    };

    const handleBan = async (userId, userName, isBanned) => {
        const action = isBanned ? "unban" : "ban";
        if (!window.confirm(`${action === "ban" ? "Ban" : "Unban"} user "${userName}"?`)) {
            return;
        }

        try {
            setActionLoading(userId);
            setError(null);
            await toggleBanUser(userId);
            setSuccess(`User "${userName}" ${action === "ban" ? "banned" : "unbanned"} successfully`);
            await fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${action} user`);
        } finally {
            setActionLoading(null);
            setShowActions(null);
        }
    };

    const isCurrentUser = (userId) => {
        const currentUserId = currentUser?._id || currentUser?.id || user?._id || user?.id;
        return currentUserId === userId;
    };

    const renderActionMenu = (userItem, isOpen, isLastRow = false) => {
        const isSelf = isCurrentUser(userItem._id);
        const isLoading = actionLoading === userItem._id;

        if (!isOpen) return null;

        return (
            <ul
                className={`absolute right-0 ${isLastRow ? "bottom-full mb-1" : "top-full mt-1"
                    } menu bg-base-100 rounded-box z-[100] w-52 p-2 shadow-2xl border border-base-300`}
            >
                {userItem.role === "admin" ? (
                    <li>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMakeStudent(userItem._id, userItem.name);
                            }}
                            disabled={isSelf || isLoading}
                            className={isSelf ? "opacity-50 cursor-not-allowed" : ""}
                            title={isSelf ? "Cannot change your own role" : ""}
                        >
                            <ShieldOff className="w-4 h-4" />
                            Make Student
                        </button>
                    </li>
                ) : (
                    <li>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMakeAdmin(userItem._id, userItem.name);
                            }}
                            disabled={isSelf || isLoading}
                            className={isSelf ? "opacity-50 cursor-not-allowed" : ""}
                            title={isSelf ? "Cannot change your own role" : ""}
                        >
                            <Shield className="w-4 h-4" />
                            Make Admin
                        </button>
                    </li>
                )}

                <li>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleBan(userItem._id, userItem.name, userItem.isBanned);
                        }}
                        disabled={isSelf || isLoading}
                        className={isSelf ? "opacity-50 cursor-not-allowed" : ""}
                        title={isSelf ? "Cannot ban yourself" : ""}
                    >
                        {userItem.isBanned ? (
                            <>
                                <Unlock className="w-4 h-4" />
                                Unban User
                            </>
                        ) : (
                            <>
                                <Ban className="w-4 h-4" />
                                Ban User
                            </>
                        )}
                    </button>
                </li>

                <div className="divider my-1"></div>

                <li>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(userItem._id, userItem.name);
                        }}
                        disabled={isSelf || isLoading}
                        className={`text-error ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={isSelf ? "Cannot delete yourself" : ""}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                    </button>
                </li>
            </ul>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden pb-12">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-base-content">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                Manage Users
            </h1>

            {success && (
                <div className="alert alert-success shadow-sm text-xs sm:text-sm">
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="alert alert-error shadow-sm text-xs sm:text-sm">
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <>
                    <div className="hidden lg:block">
                        <TableSkeleton columns={6} rows={6} label="Loading users" />
                    </div>
                    <div className="lg:hidden">
                        <CardListSkeleton count={4} label="Loading users" />
                    </div>
                </>
            ) : users.length === 0 ? (
                <div className="alert alert-info shadow-sm text-xs sm:text-sm">
                    <span>No users found</span>
                </div>
            ) : (
                <div className="card bg-base-100 border border-base-300 shadow-sm !overflow-visible">
                    <div className="card-body p-0 sm:p-2 lg:p-0 !overflow-visible">

                        {/* MOBILE / TABLET VIEW (Cards List) */}
                        <div className="block lg:hidden space-y-3 p-3 !overflow-visible">
                            {users.map((userItem, index) => {
                                const isLoading = actionLoading === userItem._id;
                                const showMenu = showActions === userItem._id;
                                const isLastRow = index >= users.length - 2;

                                return (
                                    <div
                                        key={userItem._id}
                                        className={`p-4 rounded-xl border border-base-300 bg-base-100 shadow-sm relative space-y-2 !overflow-visible ${userItem.isBanned ? "opacity-60 bg-base-200/50" : ""
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-base text-base-content truncate">
                                                    {userItem.name}
                                                </h3>
                                                <p className="text-xs text-base-content/70 break-all">
                                                    {userItem.email}
                                                </p>
                                            </div>

                                            {/* Action Dropdown for Mobile */}
                                            <div className="relative user-dropdown-container">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-ghost btn-circle"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowActions(showMenu ? null : userItem._id);
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                    ) : (
                                                        <MoreVertical className="w-4 h-4" />
                                                    )}
                                                </button>
                                                {renderActionMenu(userItem, showMenu, isLastRow)}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-base-200">
                                            <span
                                                className={`badge badge-sm font-semibold ${userItem.role === "admin" ? "badge-error" : "badge-primary"
                                                    }`}
                                            >
                                                {userItem.role?.toUpperCase()}
                                            </span>

                                            {userItem.isBanned ? (
                                                <span className="badge badge-warning badge-sm font-semibold flex items-center gap-1">
                                                    <Ban className="w-3 h-3" />
                                                    BANNED
                                                </span>
                                            ) : (
                                                <span className="badge badge-success badge-sm font-semibold flex items-center gap-1">
                                                    <Unlock className="w-3 h-3" />
                                                    ACTIVE
                                                </span>
                                            )}

                                            <span className="text-base-content/60 text-[11px] ml-auto">
                                                Joined: {new Date(userItem.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* DESKTOP VIEW (Table) */}
                        <div className="hidden lg:block !overflow-visible">
                            <table className="table w-full !overflow-visible">
                                <thead className="bg-base-200">
                                    <tr>
                                        <th className="font-bold">Name</th>
                                        <th className="font-bold">Email</th>
                                        <th className="font-bold">Role</th>
                                        <th className="font-bold">Status</th>
                                        <th className="font-bold">Joined</th>
                                        <th className="font-bold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((userItem, index) => {
                                        const isLoading = actionLoading === userItem._id;
                                        const showMenu = showActions === userItem._id;
                                        const isLastRow = index >= users.length - 2;

                                        return (
                                            <tr
                                                key={userItem._id}
                                                className={`hover:bg-base-200/50 transition-colors ${userItem.isBanned ? "opacity-60" : ""
                                                    } ${showMenu ? "relative z-30" : "relative z-0"}`}
                                            >
                                                <td className="font-semibold text-base-content">{userItem.name}</td>
                                                <td className="text-base-content/80 break-all">{userItem.email}</td>
                                                <td>
                                                    <span
                                                        className={`badge badge-md font-semibold ${userItem.role === "admin"
                                                            ? "badge-error"
                                                            : "badge-primary"
                                                            }`}
                                                    >
                                                        {userItem.role?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    {userItem.isBanned ? (
                                                        <span className="badge badge-warning badge-md font-semibold gap-1">
                                                            <Ban className="w-3 h-3" />
                                                            BANNED
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-success badge-md font-semibold gap-1">
                                                            <Unlock className="w-3 h-3" />
                                                            ACTIVE
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-sm text-base-content/70">
                                                    {new Date(userItem.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className="flex justify-center">
                                                        <div className="relative user-dropdown-container">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-ghost btn-circle"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowActions(showMenu ? null : userItem._id);
                                                                }}
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading ? (
                                                                    <span className="loading loading-spinner loading-xs"></span>
                                                                ) : (
                                                                    <MoreVertical className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            {renderActionMenu(userItem, showMenu, isLastRow)}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}