import api from '@/services/fetch';
import { atom } from 'jotai';

// Define the project type
export interface Project {
    _id: string;
    email: string;
    projectName: string;
    jurisdiction: string;
    contactName: string;
    phone: string;
    snsPlatform: string;
    snsAccountId: string;
    capacity: string;
    description: string;
    otherInformation: string;
    company:{id: string, name: string};
  }
  
  // Define the initial project state
  export const initialProject: Project = {
    _id: '',
    email: '',
    projectName: '',
    jurisdiction: '',
    contactName: '',
    phone: '',
    snsPlatform: '',
    snsAccountId: '',
    capacity: '',
    description: '',
    otherInformation: '',
    company:{id: '', name: ''}
  };


  export const projectsAtom = atom<Project[]>([]);
  export const currentProjectAtom = atom<Project>(initialProject);


 export const fetchProjects = async (id?: string, searchParam?: string) => {
  const { data } = await api.get('/projects/', { 
    params: { 
      id, 
      searchParam
    } 
  });
  return data;
};

  export const createProject = async (project: Omit<Project, 'id'>) => {
    const { data } = await api.post('/projects', project);
    return data;
  };
  
  export const updateProject = async (id: string, project: Project) => {
    const { data } = await api.put(`/projects/${id}`, project);
    return data;
  };
  
  export const deleteProject = async (id: string) => {
    await api.delete(`/projects/${id}`);
  };