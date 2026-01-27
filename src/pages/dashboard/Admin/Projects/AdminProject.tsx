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
import { format } from "date-fns";
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
    <div className="w-full px-4 py-4">
      <div className="flex flex-col gap-3 mb-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl md:text-2xl font-bold px-2 md:px-0">
          Project Management
        </h3>

        <div className="flex flex-col gap-2 px-2 md:px-0 md:flex-row md:items-center md:gap-2 md:justify-end md:min-w-[520px]">
          {/* Search grows on larger screens, full width on mobile */}
          <div className="w-full md:flex-1 md:min-w-[320px]">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              placeText="Search With Project Name/ Email"
            />
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              {/* Button full width on mobile, auto on desktop */}
              <Button
                onClick={() => {
                  setCurrentProject(initialProject);
                  setIsEditing(false);
                }}
                className="h-9 w-full md:w-auto px-3 text-xs"
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
        <div className="mt-6 w-full">
          <div className="rounded-xl border w-full overflow-x-auto">
            <Table className="min-w-full w-full table-auto text-xs text-left lg:min-w-[1100px]">
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="h-9">
                  <TableHead className="w-12 px-2 py-1 text-center">No</TableHead>

                  {/* Project Name: wider + higher priority */}
                  <TableHead className="px-2 py-1 min-w-[250px] md:min-w-[340px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("projectName")}
                      className="inline-flex items-center gap-1 hover:opacity-80"
                    >
                      Project Name <SortIcon active={sortKey === "projectName"} />
                    </button>
                  </TableHead>

                  <TableHead className="px-2 py-1 min-w-[180px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("companyName")}
                      className="inline-flex items-center gap-1 hover:opacity-80"
                    >
                      Company Name <SortIcon active={sortKey === "companyName"} />
                    </button>
                  </TableHead>

                  <TableHead className="px-2 py-1 min-w-[180px]">Email</TableHead>
                  <TableHead className="px-2 py-1 min-w-[90px]">Contact</TableHead>
                  <TableHead className="px-2 py-1 min-w-[90px]">Jurisdiction</TableHead>

                  {/* Description: flexible, takes remaining space */}
                  <TableHead className="px-2 py-1 min-w-[180px] w-full">Description</TableHead>

                  <TableHead className="px-2 py-1 w-[80px] whitespace-nowrap">Updated At</TableHead>
                  <TableHead className="px-2 py-1 w-[90px] text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedProjects.map((project, idx) => (
                  <TableRow
                    key={project._id}
                    className="h-9 cursor-pointer"
                    onClick={() => handleNavigate(project)}
                  >
                    <TableCell className="w-12 px-2 py-1 text-center whitespace-nowrap">
                      {idx + 1}
                    </TableCell>

                    {/* Project name: allow a bit more visible text */}
                    <TableCell className="px-2 py-1 font-medium min-w-[280px] md:min-w-[340px]">
                      <div className="truncate">
                        {project.projectName || "-"}
                      </div>
                    </TableCell>


                    <TableCell className="px-2 py-1">
                      <div className="truncate">{project.company?.name || "-"}</div>
                    </TableCell>

                    <TableCell className="px-2 py-1 whitespace-nowrap">
                      <div className="truncate">{project.email || "-"}</div>
                    </TableCell>

                    <TableCell className="px-2 py-1 whitespace-nowrap">
                      <div className="truncate">{project.contactName || "-"}</div>
                    </TableCell>

                    <TableCell className="px-2 py-1 whitespace-nowrap">
                      <div className="truncate">{project.jurisdiction || "-"}</div>
                    </TableCell>

                    {/* Description: flexible, still truncates */}
                    <TableCell className="px-2 py-1 whitespace-nowrap">
                      <div className="truncate">{project.description || "-"}</div>
                    </TableCell>

                    <TableCell className="px-2 py-1  whitespace-nowrap tabular-nums">
                      {project.updatedAt ? format(new Date(project.updatedAt), "yyyy-MM-dd") : "-"}
                    </TableCell>

                    <TableCell className="px-2 py-1 w-[90px] text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
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
                          className="h-7 w-7"
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
