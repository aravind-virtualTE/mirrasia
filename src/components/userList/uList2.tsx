/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Pencil, 
  Eye, 
  Building, 
  Phone, 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Plus,
  User
} from "lucide-react"

export interface User {
    _id?: string;
    fullName: string;
    email: string;
    role: string;
    picture: string;
}

interface Company {
    id: string;
    name: string;
    role: string;
    joinDate: string;
    status: 'active' | 'inactive';
}

interface ContactInfo {
    phone: string;
    address: string;
    city: string;
    country: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed';
    assignedDate: string;
}

interface UserDetails {
    companies: Company[];
    contactInfo: ContactInfo;
    lastLogin: string;
    lastAccessIP: string;
    isKYCVerified: boolean;
    outstandingTasks: Task[];
}

// Dummy data generator
const generateUserDetails = (_user: User): UserDetails => {
    const companies: Company[] = [
        { id: '1', name: 'Tech Solutions Inc.', role: 'Developer', joinDate: '2023-01-15', status: 'active' },
        { id: '2', name: 'Digital Marketing Co.', role: 'Consultant', joinDate: '2023-06-20', status: 'active' },
        { id: '3', name: 'StartUp Ventures', role: 'Advisor', joinDate: '2022-11-10', status: 'inactive' }
    ];

    const contactInfo: ContactInfo = {
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, Apt 4B',
        city: 'New York',
        country: 'United States'
    };

    const outstandingTasks: Task[] = [
        {
            id: '1',
            title: 'Complete Project Documentation',
            description: 'Finalize the technical documentation for the new project',
            priority: 'high',
            dueDate: '2024-12-15',
            status: 'pending',
            assignedDate: '2024-11-20'
        },
        {
            id: '2',
            title: 'Review Code Changes',
            description: 'Review and approve pending code changes in repository',
            priority: 'medium',
            dueDate: '2024-12-10',
            status: 'in-progress',
            assignedDate: '2024-11-25'
        }
    ];

    return {
        companies: companies.slice(0, Math.floor(Math.random() * 3) + 1),
        contactInfo,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastAccessIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        isKYCVerified: Math.random() > 0.3,
        outstandingTasks: outstandingTasks.slice(0, Math.floor(Math.random() * 3))
    };
};

// Mock data for demonstration
const mockUsers: User[] = [
    { _id: '1', fullName: 'John Doe', email: 'john.doe@example.com', role: 'admin', picture: '' },
    { _id: '2', fullName: 'Jane Smith', email: 'jane.smith@example.com', role: 'user', picture: '' },
    { _id: '3', fullName: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'hk_shdr', picture: '' },
    { _id: '4', fullName: 'Sarah Wilson', email: 'sarah.wilson@example.com', role: 'master', picture: '' },
    { _id: '5', fullName: 'David Brown', email: 'david.brown@example.com', role: 'user', picture: '' }
];

const UsersList1 = () => {
    const [users, setUsers] = useState<User[]>(mockUsers)
    const [newUser, setNewUser] = useState({ fullName: "", email: "", role: "user" })
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
    const [messageContent, setMessageContent] = useState('')
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: ''
    })

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, role: newRole } : user)))
            setSelectedUser((prevUser) => (prevUser ? { ...prevUser, role: newRole } : null))
            // Toast notification would go here
            console.log(`Updated user ${userId} role to ${newRole}`)
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const addedUser: User = {
                _id: Date.now().toString(),
                ...newUser,
                picture: ''
            };
            setUsers([...users, addedUser])
            setNewUser({ fullName: "", email: "", role: "user" })
            setIsAddUserOpen(false)
            console.log(`Added new user: ${addedUser.fullName}`)
        } catch (error) {
            console.log("error", error)
        }
    }

    const openEditRoleDialog = (user: User) => {
        setSelectedUser(user)
        setIsEditRoleOpen(true)
    }

    const openUserDetails = (user: User) => {
        setSelectedUser(user)
        setUserDetails(generateUserDetails(user))
        setIsUserDetailsOpen(true)
    }

    const handleSendMessage = () => {
        if (messageContent.trim()) {
            console.log(`Sending message to ${selectedUser?.fullName}: ${messageContent}`)
            setMessageContent('')
            setIsMessageDialogOpen(false)
            // Toast notification would go here
        }
    }

    const handleCreateTask = () => {
        if (newTask.title.trim() && newTask.description.trim()) {
            console.log(`Creating task for ${selectedUser?.fullName}:`, newTask)
            setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' })
            setIsTaskDialogOpen(false)
            // Toast notification would go here
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500'
            case 'in-progress': return 'bg-blue-500'
            case 'pending': return 'bg-gray-500'
            default: return 'bg-gray-500'
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
                            <TableHead className="h-8 px-2 text-xs w-1/5">Name</TableHead>
                            <TableHead className="h-8 px-2 text-xs w-1/5">Email</TableHead>
                            <TableHead className="h-8 px-2 text-xs w-1/5">Role</TableHead>
                            <TableHead className="h-8 px-2 text-xs w-2/5">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id} className="hover:bg-muted/50">
                                <TableCell className="p-2 text-sm font-medium">{user.fullName}</TableCell>
                                <TableCell className="p-2 text-sm">{user.email}</TableCell>
                                <TableCell className="p-2 text-sm">
                                    <Badge variant="outline">{user.role}</Badge>
                                </TableCell>
                                <TableCell className="p-2">
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openUserDetails(user)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View Details
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditRoleDialog(user)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* User Details Dialog */}
            <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
                <DialogContent className="max-width max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {selectedUser?.fullName} - User Details
                        </DialogTitle>
                    </DialogHeader>Name - User Details                     
                    {selectedUser && userDetails && (
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="companies">Companies</TabsTrigger>
                                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                                <TabsTrigger value="actions">Actions</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Basic Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Basic Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <Label className="text-sm font-medium">Full Name</Label>
                                                <p className="text-sm">{selectedUser.fullName}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Email</Label>
                                                <p className="text-sm">{selectedUser.email}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Role</Label>
                                                <Badge variant="outline">{selectedUser.role}</Badge>
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
                                                <Label className="text-sm font-medium">Phone</Label>
                                                <p className="text-sm">{userDetails.contactInfo.phone}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Address</Label>
                                                <p className="text-sm">{userDetails.contactInfo.address}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Location</Label>
                                                <p className="text-sm">{userDetails.contactInfo.city}, {userDetails.contactInfo.country}</p>
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
                                                <Label className="text-sm font-medium">Last Login</Label>
                                                <p className="text-sm">{new Date(userDetails.lastLogin).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Last Access IP</Label>
                                                <p className="text-sm font-mono">{userDetails.lastAccessIP}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Verification Status */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Verification Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                {userDetails.isKYCVerified ? (
                                                    <>
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                        <span className="text-sm text-green-600">KYC Verified</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-5 w-5 text-red-500" />
                                                        <span className="text-sm text-red-600">KYC Not Verified</span>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="companies" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            Company Associations
                                        </CardTitle>
                                        <CardDescription>
                                            Companies this user is involved with and their roles
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {userDetails.companies.map((company) => (
                                                <div key={company.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium">{company.name}</h4>
                                                            <p className="text-sm text-muted-foreground">Role: {company.role}</p>
                                                            <p className="text-sm text-muted-foreground">Joined: {new Date(company.joinDate).toLocaleDateString()}</p>
                                                        </div>
                                                        <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                                                            {company.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="tasks" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Outstanding Tasks</CardTitle>
                                        <CardDescription>
                                            Tasks assigned to this user that are pending or in progress
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {userDetails.outstandingTasks.length > 0 ? (
                                            <div className="space-y-4">
                                                {userDetails.outstandingTasks.map((task) => (
                                                    <div key={task.id} className="border rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium">{task.title}</h4>
                                                            <div className="flex gap-2">
                                                                <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                                                                    {task.priority}
                                                                </Badge>
                                                                <Badge className={`${getStatusColor(task.status)} text-white`}>
                                                                    {task.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                                        <div className="text-xs text-muted-foreground">
                                                            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                                            <p>Assigned: {new Date(task.assignedDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No outstanding tasks</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="actions" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5" />
                                                Send Message
                                            </CardTitle>
                                            <CardDescription>
                                                Send a direct message to this user
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button onClick={() => setIsMessageDialogOpen(true)} className="w-full">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Compose Message
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Plus className="h-5 w-5" />
                                                Create Task
                                            </CardTitle>
                                            <CardDescription>
                                                Assign a new task to this user
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button onClick={() => setIsTaskDialogOpen(true)} className="w-full">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create New Task
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>

            {/* Send Message Dialog */}
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Message to {selectedUser?.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Type your message here..."
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSendMessage}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Task Dialog */}
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Task for {selectedUser?.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="taskTitle">Task Title</Label>
                            <Input
                                id="taskTitle"
                                placeholder="Enter task title..."
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="taskDescription">Description</Label>
                            <Textarea
                                id="taskDescription"
                                placeholder="Describe the task..."
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="taskPriority">Priority</Label>
                                <Select
                                    value={newTask.priority}
                                    onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="taskDueDate">Due Date</Label>
                                <Input
                                    id="taskDueDate"
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTask}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Task
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
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
        </div>
    )
}

export default UsersList1