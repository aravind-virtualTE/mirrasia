/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { atom, useAtom } from 'jotai';
import { PlusCircle, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createProject, currentProjectAtom, deleteProject, fetchProjects, initialProject, Project, projectsAtom, updateProject } from './ProjectAtom';
import { allCompNameAtom } from '@/services/state';
import ProjectFormDialog from './ProjectFormDialog';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import SearchBox from '@/pages/MasterTodo/SearchBox';
import { getAllCompanyNames } from '@/services/dataFetch';

const isEditingAtom = atom<boolean>(false);
const isOpenAtom = atom<boolean>(false);

type SortKey = 'projectName' | 'companyName' | null;
type SortDir = 'asc' | 'desc';

const AdminProject: React.FC<{ id?: string }> = ({ id }) => {
  const [projects, setProjects] = useAtom(projectsAtom);
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const [isEditing, setIsEditing] = useAtom(isEditingAtom);
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const [allList, setAllList] = useAtom(allCompNameAtom);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProj, setDeleteProj] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [selectedValue, setSelectedValue] = useState(
    currentProject
      ? { id: currentProject.company?.id, name: currentProject.company?.name }
      : { id: "", name: "" }
  );

  const navigate = useNavigate();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects(id);
        setProjects(data);
        const result = await getAllCompanyNames();
        setAllList(result);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cp = currentProject?.company;
    setSelectedValue((prev) => {
      const next = { id: cp?.id || "", name: cp?.name || "" };
      return prev.id === next.id && prev.name === next.name ? prev : next;
    });
  }, [currentProject?.company?.id, currentProject?.company?.name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject({ ...currentProject, [name]: value });
  };

  // kept for ProjectFormDialog compatibility
  const handleSelectChange = (value: string) => {
    setCurrentProject({ ...currentProject, snsPlatform: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentProject._id !== null) {
        const updated = await updateProject(currentProject._id, currentProject);
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
    if (!Array.isArray(allList) || allList.length === 0) return [];
    return allList
      .map((company: any) => {
        const id =
          typeof company.id === 'string' ? company.id :
          typeof company._id === 'string' ? company._id : '';
        const rawName = Array.isArray(company.companyName)
          ? company.companyName.find((n: any) => typeof n === 'string') ?? ''
          : company.companyName ?? '';
        const name = typeof rawName === 'string'
          ? rawName.replace(/\s+/g, ' ').trim()
          : '';
        return { id, name };
      })
      .filter((c) => c.id !== '' && c.name !== '');
  };

  const filteredCompanies = getFilteredCompanies();

  const handleNavigate = (project: Project) => {
    navigate(`/project-detail/${project._id}`);
  };

  const handleDelete = async (pid: string | null) => {
    if (pid === null) return;
    setDeleteProj(pid);
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

  const loadProjects1 = async (filters: any) => {
    try {
      const { id, searchParam } = filters || {};
      const data = await fetchProjects(id, searchParam);
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const handleSearch = async () => {
    const filters: { searchParam?: string; id?: string } = {};
    if (searchQuery) filters.searchParam = searchQuery.trim();
    filters.id = id;
    loadProjects1(filters);
  };

  const handleCompanySelect = (item: { id: string; name: string } | null): void => {
    if (item === null) {
      setCurrentProject({ ...currentProject, company: { id: "", name: "" } });
      setSelectedValue({ id: "", name: "" });
      return;
    }
    const company = filteredCompanies.find((c) => c.id === item.id);
    if (company) {
      setCurrentProject({ ...currentProject, company: { id: company.id, name: company.name } });
    } else {
      setCurrentProject({ ...currentProject, company: { id: "", name: "" } });
    }
    setSelectedValue(item);
  };

  // ---------- Sorting ----------
  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    }
  };

  const sortedProjects = useMemo(() => {
    if (!sortKey) return projects;
    const copy = [...projects];
    copy.sort((a, b) => {
      const aVal = (sortKey === 'projectName'
        ? (a.projectName || '')
        : (a.company?.name || '')
      ).toString().toLowerCase();

      const bVal = (sortKey === 'projectName'
        ? (b.projectName || '')
        : (b.company?.name || '')
      ).toString().toLowerCase();

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [projects, sortKey, sortDir]);

  const SortIcon = ({ active }: { active: boolean }) =>
    active ? (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 inline" /> : <ChevronDown className="h-3.5 w-3.5 inline" />)
           : <ArrowUpDown className="h-3.5 w-3.5 inline" />;

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-bold ml-2">Project Management</h3>

        <div className="flex items-center space-x-2 mr-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
            placeText="Search With Project Name/ Email"
          />

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setCurrentProject(initialProject);
                  setIsEditing(false);
                }}
                className="h-8 px-3 text-xs"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <ProjectFormDialog
              isEditing={isEditing}
              currentProject={currentProject}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
              filteredCompanies={filteredCompanies}
              handleCompanySelect={handleCompanySelect}
              selectedValue={selectedValue}
            />
          </Dialog>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No projects added yet. Click "Add Project" to get started.
        </div>
      ) : (
        // Scroll container with sticky header
        <div className="rounded-xl border mt-6 ml-2 mr-2 overflow-auto max-h-[70vh]">
          <Table className="w-full text-sm text-left">
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="px-4 py-3">S.No</TableHead>

                {/* Sortable Project Name */}
                <TableHead className="px-4 py-3 w-[220px]">
                  <button
                    type="button"
                    onClick={() => toggleSort('projectName')}
                    className="inline-flex items-center gap-1 hover:opacity-80"
                  >
                    Project Name <SortIcon active={sortKey === 'projectName'} />
                  </button>
                </TableHead>

                {/* New Company Name column (sortable) */}
                <TableHead className="px-4 py-3 w-[260px]">
                  <button
                    type="button"
                    onClick={() => toggleSort('companyName')}
                    className="inline-flex items-center gap-1 hover:opacity-80"
                  >
                    Company Name <SortIcon active={sortKey === 'companyName'} />
                  </button>
                </TableHead>

                <TableHead className="px-4 py-3">Email</TableHead>
                <TableHead className="px-4 py-3">Contact</TableHead>
                <TableHead className="px-4 py-3">Jurisdiction</TableHead>

                {/* SNS column REMOVED */}

                <TableHead className="px-4 py-3">Description</TableHead>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedProjects.map((project, idx) => (
                <TableRow
                  key={project._id}
                  className="h-12 cursor-pointer"
                  onClick={() => handleNavigate(project)}
                >
                  <TableCell className="px-4 py-3">{idx + 1}</TableCell>
                  <TableCell className="px-4 py-3 font-medium">{project.projectName || '-'}</TableCell>
                  <TableCell className="px-4 py-3">{project.company?.name || '-'}</TableCell>
                  <TableCell className="px-4 py-3">{project.email || '-'}</TableCell>
                  <TableCell className="px-4 py-3">{project.contactName || '-'}</TableCell>
                  <TableCell className="px-4 py-3">{project.jurisdiction || '-'}</TableCell>

                  {/* SNS removed from row */}

                  <TableCell className="px-4 py-3 max-w-[280px] truncate">
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
                          handleDelete(project._id)}
                        }
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
        description={<>Are you sure you want to delete?</>}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminProject;
