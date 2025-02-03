import api from '@/services/fetch';
import { atom } from 'jotai';
// Define Jotai atoms for user and authentication state
// const isLoadingAtom = atom(true);
// import { useNavigate } from 'react-router-dom';

// Define the User interface

interface UserType {
  id: string | '';
  fullName: string | '';
  email: string | '';
  picture: string | '';
  provider: 'email' | 'google';
  role: string | '';
  email_verified: boolean | false;
}

export const userAtom = atom<UserType | null>(null);

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
// Implement the useAuth hook

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

export const signupWithGoogle = async (
  tokenId: string,
  idToken?: string,
) => {
  try {
    const response = await api.post('auth/google', { tokenId , 'inviteToken': idToken});
    console.log("response-->",response)
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Google signup failed');
  }
};


export const loginWithEmail = async (email: string, password: string,) => {
    const response = await api.post('auth/login', { email, password });
    // console.log('response->',response)
    return response.data;
  };
  
  export const loginWithGoogle = async (tokenId: string) => {
    const response = await api.post('auth/google', { tokenId });
    // console.log("response-->",response)    
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
    picture?: string;
  }) => {
    const response = await api.patch('user/profile', data);
    return response.data;
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
  };


  export const validateToken = async (data:{token? :string}) => {
    try {
      const response = await api.post('user/validate-token', data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw new Error('Token validation failed');
    }
  }