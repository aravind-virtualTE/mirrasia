import { Card } from "@/components/ui/card"
import { FolderKanban } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchProjects } from "./Projects/ProjectAtom"


const ProjectsCard: React.FC = () => {
    const navigate = useNavigate()
    const [count, setCount] = useState(0)

    useEffect(() => {
        const loadProjects = async () => {
          try {
            const data = await fetchProjects();
            setCount(data.length);
          } catch (error) {
            console.error('Failed to fetch projects', error);
          }
        };
    
        loadProjects();
      }, []);

  return (
    <Card className="p-4 cursor-pointer" onClick={() => navigate(`/projects`)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium">Projects</span>
        </div>
        <span className="text-sm text-muted-foreground">Total: <span className="font-bold">{count}</span></span>
      </div>
    </Card>

  )
}


export default ProjectsCard