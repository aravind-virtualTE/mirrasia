import React from 'react';
import { atom, useAtom } from 'jotai';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentProjectAtom, initialProject, Project, projectsAtom } from './ProjectAtom';


const isEditingAtom = atom<boolean>(false);
const isOpenAtom = atom<boolean>(false);

const AdminProject: React.FC = () => {
  const [projects, setProjects] = useAtom(projectsAtom);
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const [isEditing, setIsEditing] = useAtom(isEditingAtom);
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject({
      ...currentProject,
      [name]: value
    });
  };

  const handleSelectChange = (value: string) => {
    setCurrentProject({
      ...currentProject,
      snsPlatform: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      setProjects(
        projects.map(project => 
          project.id === currentProject.id ? currentProject : project
        )
      );
      setIsEditing(false);
    } else {
      const newProject = {
        ...currentProject,
        id: Date.now()
      };
      setProjects([...projects, newProject]);
    }
    
    setCurrentProject(initialProject);
    setIsOpen(false);
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = (id: number | null) => {
    if (id !== null) {
      setProjects(projects.filter(project => project.id !== id));
    }
  };

  const handleCancel = () => {
    setCurrentProject(initialProject);
    setIsEditing(false);
    setIsOpen(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Management</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setCurrentProject(initialProject);
              setIsEditing(false);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={currentProject.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project/Company Name</Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    value={currentProject.projectName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction/Country</Label>
                  <Input
                    id="jurisdiction"
                    name="jurisdiction"
                    value={currentProject.jurisdiction}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Person's Name</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={currentProject.contactName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={currentProject.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="snsPlatform">SNS Platform</Label>
                  <Select 
                    value={currentProject.snsPlatform} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="snsPlatform">
                      <SelectValue placeholder="Select SNS Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="kakaotalk">Kakao Talk</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="wechat">WeChat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="snsAccountId">SNS Account ID</Label>
                  <Input
                    id="snsAccountId"
                    name="snsAccountId"
                    value={currentProject.snsAccountId}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity/Position</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    value={currentProject.capacity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={currentProject.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherInformation">Other Information</Label>
                <Textarea
                  id="otherInformation"
                  name="otherInformation"
                  rows={2}
                  value={currentProject.otherInformation}
                  onChange={handleInputChange}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No projects added yet. Click "Add Project" to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead >S.No</TableHead>
                <TableHead className="w-[200px]">Project Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>SNS</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project, key) => (
                <TableRow key={project.id}>
                  <TableCell >{key+1}</TableCell>
                  <TableCell className="font-medium">{project.projectName}</TableCell>
                  <TableCell>{project.email}</TableCell>
                  <TableCell>{project.contactName}</TableCell>
                  <TableCell>{project.jurisdiction}</TableCell>
                  <TableCell>
                    {project.snsPlatform ? `${project.snsPlatform} (${project.snsAccountId})` : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {project.description ? project.description : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminProject;