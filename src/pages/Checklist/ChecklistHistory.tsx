/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { atom, useAtom } from "jotai"
import { Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCheckList, formDataAtom, getCheckList } from "./checkListData"

const currentYearAtom = atom<string>("2025")
export default function ChecklistHistory({ id, items }: { id?: string, items:any }) {
  // console.log(items,"formDataAtom--->", formDataAtom)
  const [formData, setFormData] = useAtom(formDataAtom)
  const [currentYear, setCurrentYear] = useAtom(currentYearAtom)
  const [activeTab, setActiveTab] = useState<string>("incorporation")
  const [newTaskLabel, setNewTaskLabel] = useState<string>("")
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const currentYearNum = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, i) => (currentYearNum - 5 + i).toString())

  const getData = async () =>{
    const data  = await getCheckList({'companyId' : id})
    console.log("data",data)
    if(data.length >0){
      setFormData(data[0])
    }else{
      const [incorporationItems, renewalItems] = items

      setFormData({
        companyId: id || '',
        incorporation: {
          tasks: incorporationItems,
        },
        renewal: {
          years: {
            [currentYear]: {
              tasks: renewalItems,
            },
          },
        },
      })
    }
  }
  useEffect(() =>{
    getData()
  }, [id])

  // Handle adding a new task
  const handleAddTask = () => {
    if (!newTaskLabel.trim()) return

    if (activeTab === "incorporation") {
      setFormData({
        ...formData,
        companyId : id || '',
        incorporation: {
          ...formData.incorporation,
          tasks: [
            ...formData.incorporation.tasks,
            {
              _id: `inc-${Date.now()}`,
              label: newTaskLabel,
              completed: false,
            },
          ],
        },
      })
    } else if (activeTab === "renewal") {
      // Ensure the year exists in the data structure
      const updatedYears = { ...formData.renewal.years }
      if (!updatedYears[currentYear]) {
        updatedYears[currentYear] = { tasks: [] }
      }

      updatedYears[currentYear] = {
        ...updatedYears[currentYear],
        tasks: [
          ...updatedYears[currentYear].tasks,
          {
            _id: `ren-${Date.now()}-${currentYear}`,
            label: newTaskLabel,
            completed: false,
          },
        ],
      }

      setFormData({
        ...formData,
        companyId : id || '',
        renewal: {
          ...formData.renewal,
          years: updatedYears,
        },
      })
    }

    setNewTaskLabel("")
  }

  // Handle task completion toggle
  const handleTaskToggle = (taskId: string) => {
    if (activeTab === "incorporation") {
      setFormData({
        ...formData,
        incorporation: {
          ...formData.incorporation,
          tasks: formData.incorporation.tasks.map((task) =>
            task._id === taskId ? { ...task, completed: !task.completed } : task,
          ),
        },
      })
    } else if (activeTab === "renewal") {
      const updatedYears = { ...formData.renewal.years }

      updatedYears[currentYear] = {
        ...updatedYears[currentYear],
        tasks: updatedYears[currentYear].tasks.map((task) =>
          task._id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      }

      setFormData({
        ...formData,
        renewal: {
          ...formData.renewal,
          years: updatedYears,
        },
      })
    }
  }

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    if (activeTab === "incorporation") {
      setFormData({
        ...formData,
        incorporation: {
          ...formData.incorporation,
          tasks: formData.incorporation.tasks.filter((task) => task._id !== taskId),
        },
      })
    } else if (activeTab === "renewal") {
      const updatedYears = { ...formData.renewal.years }

      updatedYears[currentYear] = {
        ...updatedYears[currentYear],
        tasks: updatedYears[currentYear].tasks.filter((task) => task._id !== taskId),
      }

      setFormData({
        ...formData,
        renewal: {
          ...formData.renewal,
          years: updatedYears,
        },
      })
    }
  }

  // Handle year change in renewal tab
  const handleYearChange = (year: string) => {
    setCurrentYear(year)

    // Create empty data structure for the year if it doesn't exist
    if (!formData.renewal.years[year]) {
      setFormData({
        ...formData,
        renewal: {
          ...formData.renewal,
          years: {
            ...formData.renewal.years,
            [year]: {
              tasks: [],
            },
          },
        },
      })
    }
  }

  // Handle save button click
  const handleSave = async () => {
    // console.log("Saving data:", formData)
    try{
       await createCheckList(formData)
      // console.log("data", data)
      await getData()
    }catch(e){
      console.log("err",e)
    }
  }
// console.log("formData",formData)
  return (
    <div className="w-full mx-auto p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="incorporation" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="incorporation">Incorporation</TabsTrigger>
              <TabsTrigger value="renewal">Renewal</TabsTrigger>
            </TabsList>

            {user.role !=='user' && (<div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewTaskLabel("")
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>)}
          </div>

          {user.role !=='user' && <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="New item label"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddTask}>Add</Button>
            <Button variant="outline">Cancel</Button>
          </div>}

          <TabsContent value="incorporation" className="mt-0">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">Incorporation Tasks</h2>
              <div className="space-y-3">
                {formData?.incorporation?.tasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={task._id}
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task._id || '')}
                        disabled={user.role =='user'}
                      />
                      <label htmlFor={task._id} className={`${task.completed ? "line-through text-gray-500" : ""}`}>
                        {task.label} {task.timestamp && <span className="text-gray-500 text-sm">{task.timestamp}</span>}
                      </label>
                    </div>
                    {user.role !=='user' && <div className="flex items-center gap-2">
                      {/* <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button> */}
                      <Button variant="ghost" className='text-red-500' size="icon" onClick={() => handleDeleteTask(task._id || '')}>
                        <Trash2 className="h-4 w-4 " />
                      </Button>
                    </div>}
                  </div>
                ))}
              </div>
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
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">Renewal Tasks ({currentYear})</h2>
              <div className="space-y-3">
                {formData?.renewal?.years[currentYear]?.tasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={task._id}
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task._id || '')}
                        disabled={user.role =='user'}
                      />
                      <label htmlFor={task._id} className={`${task.completed ? "line-through text-gray-500" : ""}`}>
                        {task.label}
                      </label>
                    </div>
                    {user.role !=='user' && <div className="flex items-center gap-2">
                      {/* <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button> */}
                      <Button variant="ghost" className='text-red-500' size="icon" onClick={() => handleDeleteTask(task._id || "")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>}
                  </div>
                ))}

                {formData.renewal.years[currentYear]?.tasks.length === 0 && (
                  <p className="text-gray-500 text-center py-2">No tasks for this year. Add a new task above.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
