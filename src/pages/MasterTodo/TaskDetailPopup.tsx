/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from "jotai"
import { format } from "date-fns"
import { Flag, X, MoreHorizontal, Trash2, } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { priorityColors, statusColors, tasksAtom, updateTask, usersAtom, deleteTodoTaskComment } from "./mTodoStore"
import { useState } from "react"
import { RichTextViewer } from "@/components/rich-text-viewer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ChatInput from "@/common/ChatInput"

const TaskDetailPopup = ({ taskId, onClose }: { taskId: string | null; onClose: () => void }) => {
    const [tasks, setTasks] = useAtom(tasksAtom)
    const [isLoading, setIsLoading] = useState(false)
    const [users,] = useAtom(usersAtom);
    const task = tasks.find((t) => t._id === taskId)
    const createdUser = users.find((user) => user._id === task?.userId)
    const commentingUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    // console.log(createdUser,"commentingUser", commentingUser)

    // console.log("task", task)
    // const handleEditComment = (comment: TaskComment, index: number) => {
    //     console.log("Edit comment:", comment, "at index:", index);
    //     // TODO: populate comment in input for editing
    // };
    const handleMessageSubmit = async (submissionData: any) => {
        // console.log("submissionData",typeof submissionData,submissionData)
        setIsLoading(true)
        const newComment = {
            text: submissionData.message.trim(),
            timestamp: new Date().toISOString(),
            author: commentingUser?.fullName || "",
            authorId: commentingUser?.id || "",
            fileUrl: submissionData.attachments[0]
        }

        try {
            if (!task || !task._id) return
            const response = await updateTask(task._id, {
                ...task,
                comments: [...((task?.comments || [])), newComment]
            })
            // console.log("response", response)
            setTasks((prev) =>
                prev.map((t) => (t._id === task._id ? response : t))
            )
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            console.error("Failed to submit comment", error)
        }

    }

    const handleDeleteComment = async (taskId: string, commentId: string) => {
        const result = await deleteTodoTaskComment(taskId, commentId);
        // console.log("Delete comment result:", result);
        if (result.message == 'Comment deleted successfully') {
            setTasks((prevTasks) =>
                prevTasks.map((task) => {
                    if (task._id !== taskId) return task;

                    return {
                        ...task,
                        comments: task.comments.filter((comment) => comment._id !== commentId),
                    };
                })
            );
        }
    };
    if (!task) return null
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
            <div className="absolute inset-0 bg-black opacity-20" />
            <div
                className="relative bg-white rounded-lg shadow-lg w-[95%] h-[95%] z-10 flex overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Section - Task Details */}
                <div className="w-1/3 p-6 overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className={`text-xs px-2 py-1 ${statusColors[task.status]}`}>
                            {task.status}
                        </Badge>
                    </div>


                    <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-sm font-medium">Title:</span>
                        <h3 className="text-xl font-semibold mb-4 whitespace-normal break-words overflow-hidden">{task.name}</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-sm font-medium">Description:</span>
                            <RichTextViewer content={task.description || ""} className="bg-gray-50 p-4 rounded-md" />
                            {/* <p
                                className="text-sm text-gray-700 whitespace-normal break-words overflow-hidden"
                                style={{ wordBreak: "break-word", hyphens: "auto" }}
                            >
                                {task.description || "No description"}
                            </p> */}
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                            <span className="text-sm font-medium">Priority:</span>
                            <div className="flex items-center gap-1">
                                <Flag className={`h-4 w-4 ${priorityColors[task.priority]}`} fill="currentColor" />
                                <span className="text-sm">{task.priority}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            <span className="text-sm">{task.status}</span>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-sm font-medium">Due date:</span>
                            <span className="text-sm">
                                {task.dueDate ? format(new Date(task.dueDate), "dd MMMM yyyy") : "No due date"}
                            </span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-sm font-medium">Created By:</span>
                            <span className="text-sm">
                                {task.userId ? createdUser?.fullName : "N/A"}
                            </span>
                        </div>

                        {task.company && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-sm font-medium">Company:</span>
                                <span className="text-sm">{task.company.name}</span>
                            </div>
                        )}

                        {task.project && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-sm font-medium">Project:</span>
                                <span className="text-sm">{task.project.name}</span>
                            </div>
                        )}

                        {task.assignees.length > 0 && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-sm font-medium">Assignees:</span>
                                <div className="flex flex-wrap gap-2">
                                    {task.assignees.map((assignee, index) => (
                                        <div key={index} className="flex items-center gap-1">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">{assignee.name.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{assignee.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Separator between sections */}
                <Separator orientation="vertical" />
                {/* Right Section - Comments */}
                <div className="w-2/3 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Comments</h4>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 hover:border hover:border-red-500"
                            onClick={onClose}
                        >
                            <X className="h-7 w-7 stroke-[2.5]" />
                        </Button>
                    </div>

                    <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                        {task.comments && task.comments.length > 0 ? (
                            task.comments.map((comment, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg relative group">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm">{comment.text}</p>
                                            <div className="flex gap-2 text-xs text-gray-500">
                                                <span>{comment.author}</span>
                                                <span>{format(new Date(comment.timestamp), "PPpp")}</span>
                                            </div>
                                        </div>
                                        { commentingUser.id == comment.authorId && <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1 rounded hover:bg-gray-200">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32">
                                                {/* <DropdownMenuItem onClick={() => handleEditComment(comment, index)}>
                                                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                </DropdownMenuItem> */}
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        // console.log("comment",comment)
                                                        if (task._id && comment._id) {
                                                            handleDeleteComment(task._id, comment._id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>}
                                    </div>

                                    {comment.fileUrl && (
                                        <div className="mt-2 rounded border overflow-hidden">
                                            <iframe
                                                src={typeof comment.fileUrl === "string" ? comment.fileUrl : URL.createObjectURL(comment.fileUrl)}
                                                className="w-full h-64"
                                                title={`Attachment ${index}`}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>No comments yet</p>
                                <p className="text-sm">Be the first to add a comment</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto">

                        <ChatInput onSubmit={handleMessageSubmit} disabled={isLoading} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskDetailPopup
