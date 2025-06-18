/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { Layers, PlusCircle } from "lucide-react";
import { TaskList } from "./TaskList";
import { createTaskFormAtom, defaultFormState, getTasks, tasksAtom, viewModeAtom } from "./mTodoStore";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { getIncorporationList } from "@/services/dataFetch";
import { allCompListAtom } from "@/services/state";
import SearchBox from "./SearchBox";

const ToDoList = () => {
    const [viewMode, setViewMode] = useAtom(viewModeAtom);
    const [openDialog, setOpenDialog] = useState(false);
    const [, setFormState] = useAtom(createTaskFormAtom);
    const [, setListState] = useAtom(tasksAtom);
    const [, setAllList] = useAtom(allCompListAtom)
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const userId = user ? user.id : ""
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            let filters = {}
            if (user.role === 'admin') filters = { userId: userId, }
            await getTasks(filters).then((response) => {
                // console.log("response--->", response)
                setListState(response);
            })
            const result = await getIncorporationList()
            setAllList(result.allCompanies)
        }
        fetchUser()
    }, [])

    const createTaskAction = () => {
        setOpenDialog(true)
        setFormState(defaultFormState);
    }

    const handleSearch = async () => {
        // console.log('Searching for:', searchQuery);
        let filters: Record<string, any> = {}
        if (user.role === 'admin') filters = { userId: userId, }
        if (searchQuery) filters['search'] = searchQuery.trim()
        await getTasks(filters).then((response) => {
            // console.log("response--->", response)
            setListState(response);
        })
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">To-do List</h1>
            </div>

            <div className="flex justify-between items-center mb-6">
                {/* Left-aligned buttons */}
                <div className="flex space-x-2">
                    <Button
                        variant={viewMode === "grouped" ? "default" : "outline"}
                        onClick={() => setViewMode("grouped")}
                        className="h-8 px-3 text-xs"
                    >
                        <Layers className="mr-2 h-4 w-4" />
                        Group By Status
                    </Button>
                    <Button
                        variant={viewMode === "expanded" ? "default" : "outline"}
                        onClick={() => setViewMode("expanded")}
                        className="h-8 px-3 text-xs"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Expand
                    </Button>
                    <Button
                        variant={viewMode === "completed" ? "default" : "outline"}
                        onClick={() => setViewMode("completed")}
                        className="h-8 px-3 text-xs"
                    >
                        Deleted
                    </Button>
                </div>

                {/* Right-aligned search + button */}
                <div className="flex items-center gap-4">
                    <SearchBox
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={handleSearch}
                        isFocused={isFocused}
                        setIsFocused={setIsFocused}
                        placeText="Search With Task Name/ Description"
                    />
                    <Button onClick={createTaskAction} className="h-8 px-3 text-xs">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create new task
                    </Button>
                </div>
            </div>

            <TaskList />

            <CreateTaskDialog open={openDialog} onOpenChange={setOpenDialog} />
        </div>
    );
};

export default ToDoList;