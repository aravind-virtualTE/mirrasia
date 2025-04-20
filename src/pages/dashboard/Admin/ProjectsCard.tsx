import { Card } from "@/components/ui/card"
import { FolderKanban } from "lucide-react"
import { useNavigate } from "react-router-dom"


const ProjectsCard: React.FC = () => {
    const navigate = useNavigate()

  return (
    <Card className="p-4 cursor-pointer" onClick={() => navigate(`/projects`)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium">Projects</span>
        </div>
        <span className="text-sm text-muted-foreground">Total: <span className="font-bold">0</span></span>
      </div>
    </Card>

  )
}


export default ProjectsCard