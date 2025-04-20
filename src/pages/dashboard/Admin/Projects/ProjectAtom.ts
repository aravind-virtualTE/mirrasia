import { atom } from 'jotai';

// Define the project type
export interface Project {
    id: number | null;
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
  }
  
  // Define the initial project state
  export const initialProject: Project = {
    id: null,
    email: '',
    projectName: '',
    jurisdiction: '',
    contactName: '',
    phone: '',
    snsPlatform: '',
    snsAccountId: '',
    capacity: '',
    description: '',
    otherInformation: ''
  };


  export const projectsAtom = atom<Project[]>([]);
  export const currentProjectAtom = atom<Project>(initialProject);