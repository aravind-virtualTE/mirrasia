/* eslint-disable @typescript-eslint/no-explicit-any */
import { addUser, updateUserRole, fetchDetailedUsersUnified, deleteUserById, sendCustomMail, createOutstandingTask, updateUserProfileData } from "@/services/dataFetch"
import { useEffect, useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { ArrowUpDown, Building, Clock, Loader2, Mail, Pencil, Phone, Save, Send, Trash2, User, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useNavigate } from "react-router-dom";
import { Textarea } from "../ui/textarea"
import CustomLoader from "../ui/customLoader"
import { Checkbox } from "../ui/checkbox"
import { ConfirmDialog } from "../shared/ConfirmDialog"
import UserVerificationCard from "./UserVerificationCard"
import SearchBox from "@/pages/MasterTodo/SearchBox"
import UserOtherDocumentsCard from "./UserOtherDocumentsCard";

export interface User {
    _id?: string;
    fullName: string;
    email: string;
    role: string;
    picture: string;
    phone?: string;
    address?: string;
    location?: string;
    lastLogin?: string;
    lastAccessIP?: string;
    lastAccessGeo?: {
        source?: string;
        countryIsoCode?: string;
        countryName?: string;
        cityName?: string;
        subdivisionName?: string;
        timeZone?: string;
        ispName?: string;
    };
    twoFactorEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
    kycDocuments?: {
        passportUrl?: string;
        addressProofUrl?: string;
        selfieUrl?: string;
        passportStatus: string,
        selfieStatus: string,
        passportComment: string,
        addressProofStatus: string,
        addressProofComment: string,
    };
    companies?: {
        companyId: string;
        companyName: string[];
        type: string;
    }[];
    tasks?: {
        label: string;
        checked: boolean;
    }[]
    otherDocuments?: {
        _id: string;
        url: string;
        name: string;
        size: number;
        type: string;
        uploadedAt: string;
        status: "pending" | "uploaded" | "verified" | "rejected" | string;
    }[];

}

type SortKey = "fullName" | "email" | "role" | "createdAt" | "updatedAt";

const formatLastAccessLocation = (user?: User | null) => {
    const geo = user?.lastAccessGeo;
    if (!geo) return "N/A";

    const parts = [
        geo.cityName,
        geo.subdivisionName,
        geo.countryName || geo.countryIsoCode,
    ].filter((value): value is string => Boolean(value && value.trim()));

    return parts.length ? parts.join(", ") : "N/A";
};

const UsersList = () => {
    const [users, setUsers] = useState<User[]>([{ _id: "", fullName: "", email: "", role: "", picture: "", createdAt: "", updatedAt: "" }])
    const [newUser, setNewUser] = useState({ fullName: "", email: "", role: "user" })
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
    const [addUserLoading, setAddUserLoading] = useState(false);
    const [roleUpdatingUserId, setRoleUpdatingUserId] = useState<string | null>(null);
    const [mailLoading, setMailLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [taskSaving, setTaskSaving] = useState(false);
    const [deleteTaskLoading, setDeleteTaskLoading] = useState(false);
    const [deleteUserLoading, setDeleteUserLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskLabel, setTaskLabel] = useState("");
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState<SortKey>("fullName");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const defaultRole = user?.role || "";

    // console.log("selectedUser", selectedUser)

    useEffect(() => {
        const load = async () => {
            try {
                const detailedUsers = await fetchDetailedUsersUnified(defaultRole);
                // console.log("detailedUsers",detailedUsers)
                setUsers(detailedUsers);
            } catch (e) {
                console.log("error", e)
                toast({
                    title: "Error",
                    description: "Failed to load users.",
                    variant: "destructive",
                });
            }
        };
        load();
    }, []);

    // const debounceRef = useRef<number | null>(null);
    // useEffect(() => {
    //     if (debounceRef.current) window.clearTimeout(debounceRef.current);
    //     debounceRef.current = window.setTimeout(async () => {
    //         try {
    //             const q = searchQuery.trim() || undefined;
    //             const data = await fetchDetailedUsers(defaultRole, q);
    //             setUsers(data);
    //         } catch (e) {
    //             // optional: silent fail or toast
    //             console.log("Search error", e)
    //         }
    //     }, 300);
    //     return () => {
    //         if (debounceRef.current) window.clearTimeout(debounceRef.current);
    //     };
    // }, [searchQuery]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!userId) return;
        setRoleUpdatingUserId(userId);
        try {
            await updateUserRole(userId, newRole);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, role: newRole } : user
                )
            )
            setSelectedUser((prevUser) =>
                (prevUser ? { ...prevUser, role: newRole } : null)
            )
            toast({
                title: "Role updated",
                description: `Updated user ${userId} role to ${newRole}`,
            })
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Error",
                description: "Failed to update user role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setRoleUpdatingUserId(null);
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddUserLoading(true);
        try {
            const addedUser = await addUser(JSON.stringify(newUser));
            setUsers([...users, addedUser])
            setNewUser({ fullName: "", email: "", role: "user" })
            setIsAddUserOpen(false)
            toast({
                title: "User added",
                description: `Added new user: ${addedUser.fullName}`,
            })
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Error",
                description: "Failed to add user. Please try again.",
                variant: "destructive",
            })
        } finally {
            setAddUserLoading(false);
        }
    }

    const openEditRoleDialog = (user: User) => {
        setSelectedUser(user)
        setIsEditRoleOpen(true)
    }

    const openUserDetails = (user: User) => {
        setSelectedUser(user)
        setIsUserDetailsOpen(true)
        // setTasks(user.tasks || []);
    }

    // console.log(selectedUser)

    const handleSendMail = async () => {
        if (!message.trim()) {
            toast({
                title: "Message required",
                description: "Please enter a message before sending.",
                variant: "destructive",
            });
            return;
        }
        setMailLoading(true);
        try {
            const data = {
                to: selectedUser?.email || "",
                message: message,
                subject: "Message from Admin",
            }
            const result = await sendCustomMail(data)
            if (result?.error) {
                throw new Error("Failed to send");
            }
            toast({
                title: "Message Sent",
                description: `Your message has been sent to ${selectedUser?.fullName || "the user"}.`,
            });
            setMessage("");
        } catch (error) {
            console.log("error", error);
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            });
        } finally {
            setMailLoading(false);
        }
    };

    const handleReviewUpdate = async (review: { passportStatus: string; addressProofStatus: string; selfieStatus: string }) => {
        if (!selectedUser || !selectedUser._id) return;
        setReviewLoading(true);
        try {
            const formData = new FormData();
            formData.append("passportStatus", review.passportStatus);
            formData.append("addressStatus", review.addressProofStatus);
            formData.append("selfieStatus", review.selfieStatus);

            await updateUserProfileData(formData, selectedUser._id);

            const updatedUser: User = {
                ...selectedUser,
                kycDocuments: selectedUser.kycDocuments
                    ? {
                        ...selectedUser.kycDocuments,
                        passportStatus: review.passportStatus,
                        addressProofStatus: review.addressProofStatus,
                        selfieStatus: review.selfieStatus,
                    }
                    : selectedUser.kycDocuments,
            };

            setSelectedUser(updatedUser);
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === updatedUser._id ? updatedUser : user
                )
            );

            toast({
                title: "Verification updated",
                description: `KYC review updated for ${selectedUser.fullName}.`,
            });
        } catch (error) {
            console.error('Failed to update review:', error);
            toast({
                title: "Error",
                description: "Failed to update verification status.",
                variant: "destructive",
            });
        } finally {
            setReviewLoading(false);
        }
    };

    const handleAddTask = () => {
        if (!taskLabel.trim()) {
            toast({
                title: "Task required",
                description: "Enter a task label before adding.",
                variant: "destructive",
            });
            return;
        }
        if (taskLabel.trim() && selectedUser) {
            const newTask = { label: taskLabel.trim(), checked: false };
            const updatedUser = {
                ...selectedUser,
                tasks: [...(selectedUser.tasks || []), newTask]
            };
            // Update both selectedUser and users array
            setSelectedUser(updatedUser);
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === selectedUser._id ? updatedUser : user
                )
            );
            setTaskLabel("");
            toast({
                title: "Task added",
                description: "Task added locally. Click Save to persist changes.",
            });
        }
    };

    const toggleTask = (index: number) => {
        if (selectedUser && selectedUser.tasks) {
            const updatedTasks = [...selectedUser.tasks];
            updatedTasks[index].checked = !updatedTasks[index].checked;
            const updatedUser = {
                ...selectedUser,
                tasks: updatedTasks
            };
            // Update both selectedUser and users array
            setSelectedUser(updatedUser);
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === selectedUser._id ? updatedUser : user
                )
            );
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedUser || !selectedUser.tasks) return;
        if (deleteIndex === null) {
            toast({
                title: "Error",
                description: "No task selected for deletion.",
                variant: "destructive",
            });
            return;
        }
        setDeleteTaskLoading(true);
        try {
            const updatedTasks = selectedUser.tasks.filter((_, i) => i !== deleteIndex);

            const updatedUser = {
                ...selectedUser,
                tasks: updatedTasks
            };

            // Update both selectedUser and users array
            setSelectedUser(updatedUser);
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === selectedUser._id ? updatedUser : user
                )
            );

            toast({
                title: "Task deleted",
                description: "Task removed locally. Click Save to persist changes.",
            });
            setDeleteDialogOpen(false);
            setDeleteIndex(null)
        } catch (error) {
            console.log("error", error);
            toast({
                title: "Error",
                description: "Failed to delete task.",
                variant: "destructive",
            });
        } finally {
            setDeleteTaskLoading(false);
        }
    }

    const handleSave = async () => {
        if (selectedUser && selectedUser.tasks) {
            // console.log("Saving data:", selectedUser.tasks)
            setTaskSaving(true);
            try {
                const object = {
                    userId: selectedUser._id || "",
                    email: selectedUser.email || "",
                    tasks: selectedUser.tasks
                }
                const data = await createOutstandingTask(object)
                if (data) {
                    toast({
                        title: "Check list",
                        description: `Check list Saved`,
                    })
                }
                // console.log("data", data)
            } catch (e) {
                console.log("err", e)
                toast({
                    title: "Error",
                    description: "Failed to save task list.",
                    variant: "destructive",
                });
            } finally {
                setTaskSaving(false);
            }
        }
    }

    const handleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortDir("asc");
        }
    };

    const ariaSort = (key: SortKey) =>
        sortBy === key ? (sortDir === "asc" ? "ascending" : "descending") : "none";

    const getVal = (u: User, key: SortKey): string => {
        if (key === "fullName") return u.fullName || "";
        if (key === "email") return u.email || "";
        if (key === "role") return u.role || "";
        if (key === "createdAt") return u.createdAt || "";
        if (key === "updatedAt") return u.updatedAt || "";
        return "";
    };

    const sortedUsers = useMemo(() => {
        const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
        const list = [...users];
        list.sort((a, b) => {
            const cmp = collator.compare(getVal(a, sortBy), getVal(b, sortBy));
            return sortDir === "asc" ? cmp : -cmp;
        });
        return list;
    }, [users, sortBy, sortDir]);

    const handleSearch = async () => {
        try {
            const q = searchQuery.trim() || undefined;
            const data = await fetchDetailedUsersUnified(defaultRole, q);
            setUsers(data);
        } catch (e) {
            console.log("error", e)
            toast({
                title: "Error",
                description: "Search failed.",
                variant: "destructive",
            });
        }
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        setDeleteUserLoading(true);
        try {
            await deleteUserById(userToDelete._id || "");
            setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
            toast({
                title: "User deleted",
                description: `${userToDelete.fullName} has been deleted.`
            });
            setDeleteUserDialogOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                title: "Error",
                description: "Failed to delete user.",
                variant: "destructive",
            });
        } finally {
            setDeleteUserLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold text-foreground leading-tight">User Management</h1>
                        <p className="text-xs text-muted-foreground">Manage users, roles, and permissions</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="font-semibold text-foreground">{users.length}</span> users
                    </div>
                    <SearchBox
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={handleSearch}
                        isFocused={isFocused}
                        setIsFocused={setIsFocused}
                        placeText="Search With User Name/ Email"
                    />
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-8 text-xs">Add User</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <Label htmlFor="fullName">Name</Label>
                                    <Input
                                        id="fullName"
                                        value={newUser.fullName}
                                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={newUser.role}
                                        onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            {/* <SelectItem value="hk_shdr">SH Dir</SelectItem> */}
                                            <SelectItem value="master">Master</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={addUserLoading}>
                                    {addUserLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        "Add User"
                                    )}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-violet-500/10" />
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead
                                    className="h-9 px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-muted/60"
                                    onClick={() => handleSort("fullName")}
                                    aria-sort={ariaSort("fullName")}
                                    title="Sort by name"
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        Name
                                        <ArrowUpDown className={`h-3 w-3 ${sortBy === "fullName" ? "text-primary" : "text-muted-foreground/50"}`} />
                                        {sortBy === "fullName" && <span className="text-[10px] text-primary font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>}
                                    </span>
                                </TableHead>

                                <TableHead
                                    className="h-9 px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-muted/60"
                                    onClick={() => handleSort("email")}
                                    aria-sort={ariaSort("email")}
                                    title="Sort by email"
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        Email
                                        <ArrowUpDown className={`h-3 w-3 ${sortBy === "email" ? "text-primary" : "text-muted-foreground/50"}`} />
                                        {sortBy === "email" && <span className="text-[10px] text-primary font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>}
                                    </span>
                                </TableHead>

                                <TableHead
                                    className="h-9 px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-muted/60"
                                    onClick={() => handleSort("role")}
                                    aria-sort={ariaSort("role")}
                                    title="Sort by role"
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        Role
                                        <ArrowUpDown className={`h-3 w-3 ${sortBy === "role" ? "text-primary" : "text-muted-foreground/50"}`} />
                                        {sortBy === "role" && <span className="text-[10px] text-primary font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>}
                                    </span>
                                </TableHead>

                                <TableHead
                                    className="h-9 px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-muted/60"
                                    onClick={() => handleSort("createdAt")}
                                    aria-sort={ariaSort("createdAt")}
                                    title="Sort by created date"
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        Created
                                        <ArrowUpDown className={`h-3 w-3 ${sortBy === "createdAt" ? "text-primary" : "text-muted-foreground/50"}`} />
                                        {sortBy === "createdAt" && <span className="text-[10px] text-primary font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>}
                                    </span>
                                </TableHead>

                                <TableHead
                                    className="h-9 px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-muted/60"
                                    onClick={() => handleSort("updatedAt")}
                                    aria-sort={ariaSort("updatedAt")}
                                    title="Sort by last login"
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        Last login
                                        <ArrowUpDown className={`h-3 w-3 ${sortBy === "updatedAt" ? "text-primary" : "text-muted-foreground/50"}`} />
                                        {sortBy === "updatedAt" && <span className="text-[10px] text-primary font-bold">{sortDir === "asc" ? "▲" : "▼"}</span>}
                                    </span>
                                </TableHead>

                                <TableHead className="h-9 px-3 py-1.5 text-xs font-semibold whitespace-nowrap w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sortedUsers.map((user) => (
                                <TableRow
                                    key={user._id}
                                    onClick={() => openUserDetails(user)}
                                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                                >
                                    <TableCell className="px-3 py-2 text-xs">
                                        <div className="max-w-[220px] truncate font-medium" title={user.fullName}>
                                            {user.fullName}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-3 py-2 text-xs">
                                        <div className="max-w-[280px] truncate text-muted-foreground" title={user.email}>
                                            {user.email}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-3 py-2 text-xs">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary capitalize">
                                            {user.role}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-3 py-2 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })
                                            : "-"}
                                    </TableCell>

                                    <TableCell className="px-3 py-2 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                                        {user.updatedAt
                                            ? new Date(user.updatedAt).toLocaleDateString("en-GB", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })
                                            : "-"}
                                    </TableCell>

                                    <TableCell className="px-1 py-1">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditRoleDialog(user);
                                                }}
                                                title="Edit"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive/90"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUserToDelete(user);
                                                    setDeleteUserDialogOpen(true);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <p className="text-sm">{selectedUser.fullName}</p>
                            </div>
                            <div>
                                <Label>Email</Label>
                                <p className="text-sm">{selectedUser.email}</p>
                            </div>
                            <div>
                                <Label>Role</Label>
                                <Select
                                    value={selectedUser.role}
                                    disabled={roleUpdatingUserId === selectedUser._id}
                                    onValueChange={(value) => handleRoleChange(selectedUser._id || "", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        {/* <SelectItem value="hk_shdr">SH Dir</SelectItem> */}
                                        <SelectItem value="master">Master</SelectItem>
                                        <SelectItem value="dcp">DCP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {roleUpdatingUserId === selectedUser._id && (
                                <p className="text-sm text-muted-foreground">Updating role...</p>
                            )}
                            <Button onClick={() => setIsEditRoleOpen(false)}>Close</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* USER DETAILS DIALOG */}
            <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
                <DialogContent
                    className="
                        w-full
                        max-w-[95vw]
                        lg:max-w-[90vw]
                        xl:max-w-[90vw]
                        2xl:max-w-[90vw]
                        max-h-[90vh]
                        overflow-y-auto
                    "
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {selectedUser?.fullName} - User Details
                        </DialogTitle>
                    </DialogHeader>
                    Name - User Details
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="companies">Companies</TabsTrigger>
                            <TabsTrigger value="tasks">Tasks</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="text-sm font-medium">Full Name: </Label>
                                            <span className="text-sm">{selectedUser?.fullName}</span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Email: </Label>
                                            <span className="text-sm">{selectedUser?.email}</span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Role: </Label>
                                            <span className="text-sm">{selectedUser?.role}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Contact Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="text-sm font-medium">Phone: </Label>
                                            <span className="text-sm">{selectedUser?.phone}</span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Address: </Label>
                                            <span className="text-sm">{selectedUser?.address}</span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Location: </Label>
                                            <span className="text-sm">{selectedUser?.location}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Activity Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="text-sm font-medium">Last Login: </Label>
                                            <span className="text-sm">
                                                {selectedUser?.lastLogin
                                                    ? new Date(selectedUser.lastLogin).toLocaleString()
                                                    : "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Last Access IP: </Label>
                                            <span className="text-sm font-mono">
                                                {selectedUser?.lastAccessIP || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Last Access Location: </Label>
                                            <span className="text-sm">
                                                {formatLastAccessLocation(selectedUser)}
                                            </span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Last Access ISP: </Label>
                                            <span className="text-sm">
                                                {selectedUser?.lastAccessGeo?.ispName || "N/A"}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <UserVerificationCard
                                passportUrl={selectedUser?.kycDocuments?.passportUrl || ""}
                                addressProofUrl={selectedUser?.kycDocuments?.addressProofUrl || ""}
                                selfieUrl={selectedUser?.kycDocuments?.selfieUrl || ""}
                                selfieStatus={selectedUser?.kycDocuments?.selfieStatus || "pending"}
                                passportStatus={selectedUser?.kycDocuments?.passportStatus || "pending"}
                                addressProofStatus={selectedUser?.kycDocuments?.addressProofStatus || "pending"}
                                onReviewUpdate={handleReviewUpdate}
                                isSubmitting={reviewLoading}
                            />
                            <UserOtherDocumentsCard docs={(selectedUser as any)?.otherDocuments || []} />
                        </TabsContent>

                        <TabsContent value="companies" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Companies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table className="min-w-full text-sm border">
                                            <TableHeader className="bg-gray-100">
                                                <TableRow>
                                                    <TableHead className="text-left px-4 py-2 border-b">S.No</TableHead>
                                                    <TableHead className="text-left px-4 py-2 border-b">Company Name</TableHead>
                                                    <TableHead className="text-left px-4 py-2 border-b">Country</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedUser?.companies?.map((company, idx) => {
                                                    return (
                                                        <TableRow
                                                            key={company.companyId}
                                                            onClick={() =>
                                                                navigate(`/company-details/${company.type}/${company.companyId}`)
                                                            }
                                                            className="hover:bg-muted/50 cursor-pointer"
                                                        >
                                                            <TableCell className="px-4 py-2 border-b">{idx + 1}</TableCell>
                                                            <TableCell className="px-4 py-2 border-b">{company.companyName ? company.companyName : "N/A"}</TableCell>
                                                            <TableCell className="px-4 py-2 border-b">{company.type}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tasks" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <CardTitle>Outstanding Tasks</CardTitle>
                                            <CardDescription>
                                                Tasks assigned to this user that are pending or in progress
                                            </CardDescription>
                                        </div>
                                        {user?.role !== 'user' && (
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" className="px-3" onClick={handleSave} disabled={taskSaving}>
                                                    {taskSaving ? (
                                                        <>
                                                            <CustomLoader />
                                                            <span className="ml-2">Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-1" />
                                                            Save
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            placeholder="Enter task"
                                            value={taskLabel}
                                            onChange={(e) => setTaskLabel(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleAddTask}>Add Task</Button>
                                    </div>

                                    {(selectedUser?.tasks || []).length === 0 ? (
                                        <p className="text-muted-foreground">No outstanding tasks</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {(selectedUser?.tasks ?? []).map((task, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between space-x-2"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`task-${index}`}
                                                            checked={task.checked}
                                                            onCheckedChange={() => toggleTask(index)}
                                                        />
                                                        <label
                                                            htmlFor={`task-${index}`}
                                                            className={`${task.checked
                                                                ? "line-through text-muted-foreground"
                                                                : ""
                                                                }`}
                                                        >
                                                            {task.label}
                                                        </label>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDeleteIndex(index)
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="actions" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mail className="h-5 w-5" />
                                            Send Mail
                                        </CardTitle>
                                        <CardDescription>
                                            Send a direct Mail to this user
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className=" flex space-y-2">
                                            <Textarea
                                                placeholder="Type your message here..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                            <Button size="sm" className="px-3" onClick={handleSendMail} disabled={mailLoading}>
                                                {mailLoading ? (
                                                    <>
                                                        <CustomLoader />
                                                        <span className="ml-2">Sending...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-1" />
                                                        <span>Send</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Task"
                description={
                    <>
                        Are you sure you want to delete this Task?
                    </>
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteTask}
                isLoading={deleteTaskLoading}
                loadingText="Deleting..."
            />

            <ConfirmDialog
                open={deleteUserDialogOpen}
                onOpenChange={setDeleteUserDialogOpen}
                title="Delete User"
                description={`Are you sure you want to delete user "${userToDelete?.fullName}"? This action cannot be undone.`}
                confirmText="Delete User"
                cancelText="Cancel"
                onConfirm={confirmDeleteUser}
                isLoading={deleteUserLoading}
                loadingText="Deleting user..."
            />
        </div>
    )
}

export default UsersList
