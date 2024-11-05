import api from '@/services/fetch';
import { atom, useAtom } from 'jotai';
// Define Jotai atoms for user and authentication state
const userAtom = atom<User | null>(null);
const isLoadingAtom = atom(true);
const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
import { useNavigate } from 'react-router-dom';

// Define the User interface
interface User {
    uid: string;
    displayName: string;
    photoURL: string;
}
// Implement the useAuth hook
export const useAuth = () => {
    const navigate = useNavigate();
    const [user, setUser] = useAtom(userAtom);
    const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
    const [isAuthenticated] = useAtom(isAuthenticatedAtom);
    const login = async (userData: User) => {
        setIsLoading(true);
        setUser(userData);
        setIsLoading(false);
    };
    const logout = async () => {
        setIsLoading(true);
        setUser(null);
        setIsLoading(false);
        navigate('/');
    };
    return { user, isLoading, isAuthenticated, login, logout };
};


interface UserType {
    id: string;
    fullName: string;
    email: string;
    picture: string;
    provider: 'email' | 'google';
    role: string;
    email_verified: boolean;
  }

  interface AuthState {
    user: UserType | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  }

  const initialAuthState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  export const authAtom = atom<AuthState>(initialAuthState);

// Loading atom
export const loadingAtom = atom(
    (get) => get(authAtom).loading,
    (get, set, loading: boolean) => {
      set(authAtom, { ...get(authAtom), loading, error: null });
    }
  );


export const signupWithEmail = async (
  fullName: string,
  email: string,
  password: string,
) => {
  try {
    const response = await api.post('auth/signup', { fullName,email, password });
    
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Signup failed');
  }
};

export const signupWithGoogle = async (tokenId: string) => {
  try {
    const response = await api.post('auth/google', { tokenId });
    console.log("response-->",response)    
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Google signup failed');
  }
};


export const loginWithEmail = async (email: string, password: string) => {
    const response = await api.post('auth/login', { email, password });
    console.log('response->',response)
    localStorage.setItem('token', response.data.token);    
    return response.data;
  };
  
  export const loginWithGoogle = async (tokenId: string) => {
    const response = await api.post('auth/google', { tokenId });
    console.log("response-->",response)    
    return response.data;
  };
  
  export const getUserProfile = async () => {
    const response = await api.get('user/profile');
    return response.data;
  };
  
  export const updateUserProfile = async (data: {
    fullName?: string;
    bio?: string;
    location?: string;
    avatar?: string;
  }) => {
    const response = await api.patch('user/profile', data);
    return response.data;
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
  };
