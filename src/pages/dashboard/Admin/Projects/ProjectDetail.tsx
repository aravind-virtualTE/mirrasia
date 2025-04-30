import React, { useMemo } from "react"
import { useAtom } from "jotai"
import { useNavigate, useParams } from "react-router-dom"
import { projectsAtom } from "./ProjectAtom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import ProjectsTask from "./ProjectTask"
// import ProjectsTask from "./ProjectTask"

interface ProjectDetailProps {
    compId?: string
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ compId }) => {
    const { id: paramId } = useParams()
    const [projects] = useAtom(projectsAtom)
    const navigate = useNavigate()
  
    const project = useMemo(() => {
      if (compId) {
        return projects.find((p) => p.company?.id === compId)
      }
      if (paramId) {
        return projects.find((p) => p._id === paramId)
      }
      return null
    }, [projects, paramId, compId])
  
    if (!project) return <p className="ml-8 mr-8 mt-4">No project found</p>

    const data: Record<string, string> = {
        ID: project._id,
        "Project Name": project.projectName,
        "Contact Name": project.contactName,
        Email: project.email,
        Phone: project.phone,
        "SNS Platform": project.snsPlatform,
        "SNS Account ID": project.snsAccountId,
        Jurisdiction: project.jurisdiction,
        Company: project.company?.name || "N/A",
        Description: project.description,
        Capacity: project.capacity,
        "Other Information": project.otherInformation,
    }
    return (
        <div className="space-y-4 px-4 md:px-8 mt-2">
            {paramId && paramId !== "" && (
                <div className="flex justify-end">
                    <Button onClick={() => navigate("/projects")} size="sm" className="flex items-center gap-2">
                        Back to Projects
                    </Button>
                </div>
            )}
            <ProjectsTask id={project._id} name={project.projectName} />
            <Card className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
                <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                    {/* if (id !== "" && id !== undefined) */}
                </CardHeader>
                <CardContent className="overflow-x-auto p-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b">
                                <TableHead className="w-1/2 min-w-[150px] text-sm font-medium">Field</TableHead>
                                <TableHead className="w-1/2 min-w-[200px] text-sm font-medium">Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(data).map(([key, value]) => (
                                <TableRow key={key} className="border-b hover:bg-muted/30">
                                    <TableCell className="py-2 px-3 font-medium">{key}</TableCell>
                                    <TableCell className="py-2 px-3 break-words">{value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProjectDetail
