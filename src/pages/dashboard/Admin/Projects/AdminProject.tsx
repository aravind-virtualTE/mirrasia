import React, { useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createProject, currentProjectAtom, deleteProject, fetchProjects, initialProject, Project, projectsAtom, updateProject } from './ProjectAtom';
import { allCompListAtom } from '@/services/state';
import ProjectFormDialog from './ProjectFormDialog';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const isEditingAtom = atom<boolean>(false);
const isOpenAtom = atom<boolean>(false);

const AdminProject: React.FC = () => {
  const [projects, setProjects] = useAtom(projectsAtom);
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const [isEditing, setIsEditing] = useAtom(isEditingAtom);
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const [allList] = useAtom(allCompListAtom);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProj, setDeleteProj] = useState('');
  
  const navigate = useNavigate()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };

    loadProjects();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log(isEditing, currentProject._id)
    try {
      if (isEditing && currentProject._id !== null) {
        const updated = await updateProject(currentProject._id, currentProject);
        // console.log("updated--->", updated)
        setProjects(projects.map(p => p._id === updated._id ? updated : p));
      } else {
        const created = await createProject(currentProject);
        setProjects([...projects, created]);
      }
    } catch (error) {
      console.error('Error saving project', error);
    }

    setCurrentProject(initialProject);
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleCancel = () => {
    setCurrentProject(initialProject);
    setIsEditing(false);
    setIsOpen(false);
  };

  const getFilteredCompanies = () => {
    if (allList.length > 0) {
      return allList.map((company) => {
        if (typeof company._id === 'string' && Array.isArray(company.companyName) && typeof company.companyName[0] === 'string') {
          return {
            id: company._id,
            name: company.companyName[0],
          };
        }
        return { id: '', name: '' };
      }).filter(company => company.id !== '');
    }
    return [];
  };

  const filteredCompanies = getFilteredCompanies();

  const handleCompanyChange = (companyId: string) => {
    const company = filteredCompanies.find(c => c.id === companyId);
    if (company) {
      setCurrentProject({
        ...currentProject,
        company: {
          id: company.id,
          name: company.name
        }
      });
    } else {
      setCurrentProject({
        ...currentProject,
        company: { id: "", name: "" }
      });
    }
  };

  const handleNavigate = (project: Project) => {
    // console.log("project--->", project)
    navigate(`/project-detail/${project._id}`)
  };

  const handleDelete = async (id: string | null) => {
    if (id === null) return;
    setDeleteProj(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProject(deleteProj);
      setProjects(projects.filter(project => project._id !== deleteProj));
      setDeleteDialogOpen(false);
      setDeleteProj('');
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-2 ">
        <h3 className="text-2xl font-bold ml-2">Project Management</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setCurrentProject(initialProject);
              setIsEditing(false);
            }} className="h-8 px-3 text-xs mr-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <ProjectFormDialog
            isEditing={isEditing}
            currentProject={currentProject}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleCompanyChange={handleCompanyChange}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            filteredCompanies={filteredCompanies}
          />
        </Dialog>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No projects added yet. Click "Add Project" to get started.
        </div>
      ) : (
        <div className="rounded-xl border mt-6 ml-2 mr-2">
          <Table className="w-full text-sm text-left">
            <TableHeader className="">
              <TableRow>
                <TableHead className="px-4 py-3">S.No</TableHead>
                <TableHead className="px-4 py-3 w-[200px]">Project Name</TableHead>
                <TableHead className="px-4 py-3">Email</TableHead>
                <TableHead className="px-4 py-3">Contact</TableHead>
                <TableHead className="px-4 py-3">Jurisdiction</TableHead>
                <TableHead className="px-4 py-3">SNS</TableHead>
                <TableHead className="px-4 py-3">Description</TableHead>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project, key) => (
                <TableRow
                  key={project._id}
                  className="h-12 cursor-pointer"
                  onClick={() => handleNavigate(project)}
                >
                  <TableCell className="px-4 py-3" >{key + 1}</TableCell>
                  <TableCell className="px-4 py-3 font-medium" >{project.projectName}</TableCell>
                  <TableCell className="px-4 py-3">{project.email}</TableCell>
                  <TableCell className="px-4 py-3">{project.contactName}</TableCell>
                  <TableCell className="px-4 py-3">{project.jurisdiction}</TableCell>
                  <TableCell className="px-4 py-3">
                    {project.snsPlatform ? `${project.snsPlatform} (${project.snsAccountId})` : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-[200px] truncate">
                    {project.description ? project.description : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project._id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Task"
        description={
          <>
            Are you sure you want to delete?
            ?
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminProject;