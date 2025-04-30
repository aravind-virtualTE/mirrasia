import { useAtom } from "jotai"
import { format } from "date-fns"
import { Flag, Send, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { priorityColors, statusColors, tasksAtom, updateTask, usersAtom } from "./mTodoStore"
import { useState } from "react"
import { RichTextViewer } from "@/components/rich-text-viewer"

const TaskDetailPopup = ({ taskId, onClose }: { taskId: string | null; onClose: () => void }) => {
    const [tasks, setTasks] = useAtom(tasksAtom)
    const [comment, setComment] = useState("")
    const [users,] = useAtom(usersAtom);
    const task = tasks.find((t) => t._id === taskId)
    const createdUser = users.find((user) => user._id === task?.userId)
    // console.log("task", createdUser)
    const handleCommentSubmit = async () => {
        if (!comment.trim()) return
        const newComment = {
            text: comment.trim(),
            timestamp: new Date().toISOString(),
            author: ""
        }

        try {
            if (!task || !task._id) return
            const response = await updateTask(task._id, {
                ...task,
                comments: [...((task?.comments || [])), newComment]
            })
            setTasks((prev) =>
                prev.map((t) => (t._id === task._id ? response : t))
            )
            setComment("")
        } catch (error) {
            console.error("Failed to submit comment", error)
        }
    }

    if (!task) return null
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
            <div className="absolute inset-0 bg-black opacity-20" />
            <div
                className="relative bg-white rounded-lg shadow-lg w-[80%] h-[80%] z-10 flex overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Section - Task Details */}
                <div className="w-1/2 p-6 overflow-y-auto">
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
                <div className="w-1/2 p-6 flex flex-col h-full">
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
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        {/* <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">U</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{comment.author || "User"}</span> */}
                                        <p className="text-sm">{comment.text}</p>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(comment.timestamp), "PPpp")}
                                        </span>
                                    </div>

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
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a comment..."
                                className="flex-grow"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCommentSubmit()
                                }}
                            />
                            <Button size="sm" className="px-3" onClick={handleCommentSubmit}>
                                <Send className="h-4 w-4 mr-1" />
                                Send
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskDetailPopup
