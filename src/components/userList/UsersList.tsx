import { addUser, updateUserRole, fetchDetailedUsers, sendCustomMail, createOutstandingTask } from "@/services/dataFetch"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Building, Clock, Mail, Pencil, Phone, Save, Send, Shield, Trash2, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useNavigate } from "react-router-dom";
import { Textarea } from "../ui/textarea"
import CustomLoader from "../ui/customLoader"
import { Checkbox } from "../ui/checkbox"
import { ConfirmDialog } from "../shared/ConfirmDialog"
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
    kycDocuments?: {
        passportUrl?: string;
        addressProofUrl?: string;
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
}

const UsersList = () => {
    const [users, setUsers] = useState<User[]>([{ _id: "", fullName: "", email: "", role: "", picture: "" }])
    const [newUser, setNewUser] = useState({ fullName: "", email: "", role: "user" })
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskLabel, setTaskLabel] = useState("");
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const navigate = useNavigate();
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

    useEffect(() => {
        const fetchUser = async () => {
            const [detailedUsersResponse] = await Promise.all([
                // fetchUsers(),
                fetchDetailedUsers(),
            ]);
            // console.log("detailed response", detailedUsersResponse);
            setUsers(detailedUsersResponse);
            //   setDetailedUsers(detailedUsersResponse);
        }
        fetchUser()
    }, [])

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, role: newRole } : user)))
            setSelectedUser((prevUser) => (prevUser ? { ...prevUser, role: newRole } : null))
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
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
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
        if (message.trim()) {
            setIsLoading(true);
            const data = {
                to: selectedUser?.email || "",
                message: message,
                subject: "Message from Admin",
            }
            const result = await sendCustomMail(data)
            if (result.error) {
                toast({
                    title: "Error",
                    description: "Failed to send message. Please try again.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            } else {
                toast({
                    title: "Message Sent",
                    description: `Your message has been sent to ${selectedUser?.fullName || "the user"}.`,
                });
            }
            // console.log("Mail sent result:", result);
            // setSentMessages((prev) => [...prev, { id: Date.now(), content: message }]);
            setMessage("");
            setIsLoading(false);
        }
    };

    // const handleAddTask = () => {
    //     if (taskLabel.trim()) {
    //         setTasks([...tasks, { label: taskLabel.trim(), checked: false, _id: '' }]);
    //         setTaskLabel("");
    //     }
    // };
    // const toggleTask = (index: number) => {
    //     const updatedTasks = [...tasks];
    //     updatedTasks[index].checked = !updatedTasks[index].checked;
    //     setTasks(updatedTasks);
    // };
    // const handleDeleteTask = async () => {
    //     const sndData = {
    //         index: index,
    //         userId: selectedUser?._id || "",
    //     }
    //     console.log("Deleting task at index:", sndData);
    //     const updatedTasks = tasks.filter((_, i) => i !== index);
    //     const data = await delOutstandingTask(sndData)
    //     console.log("data", data)
    //     setTasks(updatedTasks);
    //     setDeleteDialogOpen(false);
    //     setDeleteIndex(null)
    // }

    const handleAddTask = () => {
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
        if (selectedUser && selectedUser.tasks) {
            const sndData = {
                index: deleteIndex,
                userId: selectedUser._id || "",
            }
            console.log("Deleting task at index:", sndData);
            const updatedTasks = selectedUser.tasks.filter((_, i) => i !== deleteIndex);
            // const data = await delOutstandingTask(sndData)
            // console.log("data", data)

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
            setDeleteDialogOpen(false);
            setDeleteIndex(null)
        }
    }

    const handleSave = async () => {
        if (selectedUser && selectedUser.tasks) {
            // console.log("Saving data:", selectedUser.tasks)
            try {
                setIsLoading(true);
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
                setIsLoading(false);
                // console.log("data", data)
            } catch (e) {
                console.log("err", e)
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button>Add User</Button>
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
                                        <SelectItem value="hk_shdr">SH Dir</SelectItem>
                                        <SelectItem value="master">Master</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">Add User</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                            <TableHead className="h-8 px-2 text-xs w-1/4">Name</TableHead>
                            <TableHead className="h-8 px-2 text-xs w-1/4">Email</TableHead>
                            <TableHead className="h-8 px-2 text-xs w-1/4">Role</TableHead>
                            <TableHead className="h-8 px-2 text-xs w-1/4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id} onClick={() => openUserDetails(user)} className="hover:bg-muted/50">
                                <TableCell className="p-2 text-sm">{user.fullName}</TableCell>
                                <TableCell className="p-2 text-sm">{user.email}</TableCell>
                                <TableCell className="p-2 text-sm">{user.role}</TableCell>
                                <TableCell className="p-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEditRoleDialog(user)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
                                    onValueChange={(value) => handleRoleChange(selectedUser._id || "", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="hk_shdr">SH Dir</SelectItem>
                                        <SelectItem value="master">Master</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => setIsEditRoleOpen(false)}>Close</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
                <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {selectedUser?.fullName} - User Details
                        </DialogTitle>
                    </DialogHeader>Name - User Details
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
                                            {/* <p className="text-sm font-mono">{userDetails.lastAccessIP}</p> */}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Verification Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col lg:flex-row gap-4">
                                    {selectedUser?.kycDocuments?.passportUrl ? (
                                        <div className="flex-1">
                                            <Label className="mb-2 block">Passport Document</Label>
                                            <iframe
                                                src={selectedUser.kycDocuments.passportUrl}
                                                className="w-full h-96 border"
                                                title="Passport Document"
                                            />
                                            <Button asChild className="mt-2">
                                                <a
                                                    href={selectedUser.kycDocuments.passportUrl}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download Passport/Govt Id
                                                </a>
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Passport document not uploaded yet.</p>
                                    )}

                                    {selectedUser?.kycDocuments?.addressProofUrl ? (
                                        <div className="flex-1">
                                            <Label className="mb-2 block">Address Proof</Label>
                                            <iframe
                                                src={selectedUser.kycDocuments.addressProofUrl}
                                                className="w-full h-96 border"
                                                title="Address Proof Document"
                                            />
                                            <Button asChild className="mt-2">
                                                <a
                                                    href={selectedUser.kycDocuments.addressProofUrl}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download Address Proof
                                                </a>
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Address proof not uploaded yet.</p>
                                    )}
                                </CardContent>

                            </Card>
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
                                                        <TableRow key={company.companyId} onClick={() =>
                                                            navigate(`/company-details/${company.type}/${company.companyId}`)} className="hover:bg-muted/50 cursor-pointer">
                                                            <TableCell className="px-4 py-2 border-b">{idx + 1}</TableCell>
                                                            <TableCell className="px-4 py-2 border-b">{company.companyName[0]}</TableCell>
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
                                        {user.role !== 'user' && (<div className="flex items-center gap-2">
                                            <Button size="sm" className="px-3" onClick={handleSave}>
                                                {isLoading ? (
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
                                        </div>)}
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
                                                            className={`${task.checked ? "line-through text-muted-foreground" : ""
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
                                            <Button size="sm" className="px-3" onClick={handleSendMail}>
                                                {isLoading ? (
                                                    <>
                                                        <CustomLoader />
                                                        <span className="ml-2">Saving...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-1" />
                                                        <span>Send</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Sent Messages 
                                        <div className="space-y-2 pt-4 border-t">
                                            <p className="font-semibold text-sm text-muted-foreground">Sent Messages</p>
                                            {sentMessages.map((msg) => (
                                                <div key={msg.id} className="p-3 rounded-md border text-sm bg-muted">
                                                    {msg.content}
                                                </div>
                                            ))}
                                        </div>*/}
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
            />
        </div>
    )
}

export default UsersList