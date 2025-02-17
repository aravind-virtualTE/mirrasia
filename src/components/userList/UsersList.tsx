// import React from 'react'

import { addUser, fetchUsers } from "@/services/dataFetch"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Pencil } from "lucide-react"

interface User {
    id?: string;
    fullName: string;
    email: string;
    role: string;
}
const UsersList = () => {
    const [users, setUsers] = useState<User[]>([{ id: "", fullName: "", email: "", role: "" }])
    const [newUser, setNewUser] = useState({ fullName: "", email: "", role: "user" })
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            await fetchUsers().then((response) => {
                console.log("response", response)
                setUsers(response)
            })
        }
        fetchUser()
    }, [])

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            // Here you would typically call an API to update the user's role
            // await updateUserRole(userId, newRole);
            setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
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
            // Here you would typically call an API to add the new user
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

    console.log("users", users)
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
                                        <SelectItem value="sh_dir">SH Dir</SelectItem>
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
                            <TableRow key={user.id} className="hover:bg-muted/50">
                                <TableCell className="p-2 text-sm" >{user.fullName}</TableCell>
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
                                    onValueChange={(value) => handleRoleChange(selectedUser?.id || "", value )}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="sh_dir">SH Dir</SelectItem>
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

export default UsersList