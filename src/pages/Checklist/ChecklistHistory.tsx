/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { atom, useAtom } from "jotai"
import { Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCheckList, formDataAtom, getCheckList } from "./checkListData"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { usersAtom } from "../MasterTodo/mTodoStore"

const currentYearAtom = atom<string>("2025")

export default function ChecklistHistory({ id, items }: { id?: string, items: any }) {
  const [formData, setFormData] = useAtom(formDataAtom)
  const [currentYear, setCurrentYear] = useAtom(currentYearAtom)
  const [activeTab, setActiveTab] = useState<string>("incorporation")
  const [newTaskLabel, setNewTaskLabel] = useState<string>("")
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const currentYearNum = new Date().getFullYear()
  const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYearNum - 6 + i).toString())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState('');
  const [users] = useAtom(usersAtom);

  const getData = async () => {
    const data = await getCheckList({ 'companyId': id })
    if (data.length > 0) {
      setFormData(data[0])
    } else {
      const [incorporationItems, renewalItems] = items
      setFormData({
        companyId: id || '',
        incorporation: { tasks: incorporationItems },
        renewal: {
          years: {
            [currentYear]: { tasks: renewalItems },
          },
        },
        miscellaneous: {
          tasks: [],
        },
      })
    }
  }

  useEffect(() => {
    getData()
  }, [id])

  const handleAddTask = () => {
    if (!newTaskLabel.trim()) return

    const newTask = {
      _id: `${activeTab.slice(0, 3)}-${Date.now()}`,
      label: newTaskLabel,
      completed: false,
    }

    if (activeTab === "incorporation") {
      setFormData({
        ...formData,
        companyId: id || '',
        incorporation: {
          ...formData.incorporation,
          tasks: [...formData.incorporation.tasks, newTask],
        },
      })
    } else if (activeTab === "renewal") {
      const updatedYears = { ...formData.renewal.years }
      if (!updatedYears[currentYear]) {
        updatedYears[currentYear] = { tasks: [] }
      }
      updatedYears[currentYear].tasks.push(newTask)
      setFormData({
        ...formData,
        companyId: id || '',
        renewal: {
          ...formData.renewal,
          years: updatedYears,
        },
      })
    } else if (activeTab === "miscellaneous") {
      setFormData({
        ...formData,
        companyId: id || '',
        miscellaneous: {
          tasks: [...(formData.miscellaneous?.tasks || []), newTask],
        },
      })
    }

    setNewTaskLabel("")
  }

  const handleTaskToggle = (taskId: string) => {
    const toggleTask = (task: any) => {
      const isCompleted = !task.completed
      return {
        ...task,
        completed: isCompleted,
        userid: isCompleted ? user.id : undefined,
        timestamp: isCompleted ? new Date().toLocaleString() : undefined,
      }
    }

    if (activeTab === "incorporation") {
      setFormData({
        ...formData,
        incorporation: {
          ...formData.incorporation,
          tasks: formData.incorporation.tasks.map((task) =>
            task._id === taskId ? toggleTask(task) : task
          ),
        },
      })
    } else if (activeTab === "renewal") {
      const updatedYears = {
        ...formData.renewal.years,
        [currentYear]: {
          ...formData.renewal.years[currentYear],
          tasks: formData.renewal.years[currentYear].tasks.map((task) =>
            task._id === taskId ? toggleTask(task) : task
          ),
        },
      }
      setFormData({
        ...formData,
        renewal: {
          ...formData.renewal,
          years: updatedYears,
        },
      })
    } else if (activeTab === "miscellaneous") {
      setFormData({
        ...formData,
        miscellaneous: {
          tasks: formData.miscellaneous.tasks.map((task) =>
            task._id === taskId ? toggleTask(task) : task
          ),
        },
      })
    }
  }

  const handleDeleteTask = () => {
    if (activeTab === "incorporation") {
      setFormData({
        ...formData,
        incorporation: {
          tasks: formData.incorporation.tasks.filter((t) => t._id !== deleteItem),
        },
      })
    } else if (activeTab === "renewal") {
      const updated = {
        ...formData.renewal.years[currentYear],
        tasks: formData.renewal.years[currentYear].tasks.filter((t) => t._id !== deleteItem),
      }
      setFormData({
        ...formData,
        renewal: {
          ...formData.renewal,
          years: {
            ...formData.renewal.years,
            [currentYear]: updated,
          },
        },
      })
    } else if (activeTab === "miscellaneous") {
      setFormData({
        ...formData,
        miscellaneous: {
          tasks: formData.miscellaneous.tasks.filter((t) => t._id !== deleteItem),
        },
      })
    }

    setDeleteItem('')
    setDeleteDialogOpen(false)
  }

  const handleDeleteClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteItem(taskId)
    setDeleteDialogOpen(true)
  }

  const handleYearChange = (year: string) => {
    setCurrentYear(year)
    const [, renewalItems] = items
    if (!formData.renewal.years[year]) {
      setFormData({
        ...formData,
        renewal: {
          ...formData.renewal,
          years: {
            ...formData.renewal.years,
            [year]: { tasks: renewalItems },
          },
        },
      })
    }
  }

  const handleSave = async () => {
    try {
      const data = await createCheckList(formData)
      if (data) {
        toast({ title: "Checklist", description: "Checklist Saved" })
        await getData()
      }
    } catch (e) {
      console.log("err", e)
    }
  }

  const renderTasks = (tasks: any[]) => (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task._id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id={task._id}
              checked={task.completed}
              onCheckedChange={() => handleTaskToggle(task._id)}
              disabled={user.role === "user"}
            />
            <label htmlFor={task._id} className={`${task.completed ? "line-through text-gray-500" : ""}`}>
              {task.label}
              {task.userid && users?.length > 0 && (() => {
                const u = users.find(u => u._id === task.userid);
                return u ? <span className="text-sm ml-2 mr-2">{u.fullName}</span> : null;
              })()}
              {task.timestamp && <span className="text-gray-500 text-sm">{task.timestamp}</span>}
            </label>
          </div>
          {user.role !== "user" && (
            <Button variant="ghost" className="text-red-500" size="icon" onClick={(e) => handleDeleteClick(task._id, e)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {tasks.length === 0 && <p className="text-gray-500 text-center py-2">No tasks yet. Add a new one above.</p>}
    </div>
  )

  return (
    <div className="w-full mx-auto p-4 border rounded-lg shadow-sm">
      <Tabs defaultValue="incorporation" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="incorporation">Incorporation</TabsTrigger>
            <TabsTrigger value="renewal">Renewal</TabsTrigger>
            <TabsTrigger value="miscellaneous">Miscellaneous</TabsTrigger>
          </TabsList>
          {user.role !== "user" && (
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </div>

        {user.role !== "user" && (
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="New item label"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddTask}>Add</Button>
            <Button variant="outline" onClick={() => setNewTaskLabel("")}>Cancel</Button>
          </div>
        )}

        <TabsContent value="incorporation" className="mt-0">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Incorporation Tasks</h2>
            {renderTasks(formData?.incorporation?.tasks || [])}
          </div>
        </TabsContent>

        <TabsContent value="renewal" className="mt-0">
          <div className="mb-4">
            <Select value={currentYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Renewal Tasks ({currentYear})</h2>
            {renderTasks(formData?.renewal?.years[currentYear]?.tasks || [])}
          </div>
        </TabsContent>

        <TabsContent value="miscellaneous" className="mt-0">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Miscellaneous Tasks</h2>
            {renderTasks(formData?.miscellaneous?.tasks || [])}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Checklist"
        description="Are you sure you want to delete this task?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTask}
      />
    </div>
  )
}
