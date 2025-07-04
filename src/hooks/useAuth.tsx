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
    const response = await api.post('auth/signup', { fullName, email, password });
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
    const response = await api.post('auth/google', { tokenId, 'inviteToken': idToken });
    console.log("response-->", response)
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


export const validateToken = async (data: { token?: string }) => {
  try {
    const response = await api.post('user/validate-token', data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Token validation failed');
  }
}

export const resetPassword = async (email: string, newPassword: string) => {
  const response = await api.post('/auth/reset-password', { email, newPassword });
  return response.data;
};


export const enable2FA = async (userId: string) => {
  const response = await api.post(`/auth/enable-2fa/${userId}`);
  if (response.data.success) {
    return {
      qrCode: response.data.qrCode,
      secret: response.data.secret,
      backupCodes: response.data.backupCodes,
    };
  } else {
    return {
      qrCode: "",
      secret: "",
      backupCodes: ['', '']
    }

  }
}

export const verify2FA = async (userId: string, code: string) => {
   const response = await api.post(`/auth/verify-2fa/${userId}`, {token: code});
   if(response.data.success) {
      return { success: true, message: "2FA verification successful", backupCodes: response.data.backupCodes };
   }else{
     return { success: false, message: "2FA verification failed", backupCodes: [] }
   }
}

export const disable2FA = async (userId: string, disableCode: string) => {
  const response = await api.post(`/auth/disable-2fa/${userId}`, {token: disableCode});
   if(response.data.success) {
      return { success: true, message: "2FA verification successful", backupCodes: response.data.backupCodes };
   }else{
      return { success: false, message: "2FA disabled successfully" }
   }
}

export const generate2FABackupCodes = async (userId: string) => {
  const response = await api.post(`/auth/generate-backup-codes/${userId}`);
  if (response.data.success) {
    return { backupCodes: response.data.backupCodes };
  }else{
    return { backupCodes: ['', ''], success: false, message: "Failed to generate backup codes" }
  }
  
}

export const verify2Fa =async (userId: string, disableCode: string) => {
  const response = await api.post(`/auth/verify-2fa`, {token: disableCode, userId});
   if(response.data.success) {
      return { success: true, message: "2FA verification successful", backupCodes: response.data.backupCodes };
   }else{
      return { success: false, message: "2FA disabled successfully" }
   }
}

export const verify2FaLogin =async (userId: string, disableCode: string) => {
  const response = await api.post(`/auth/verify-2fa-login`, {token: disableCode, userId});
   if(response.data.success) {
      return response.data;
   }else{
      return { success: false, message: "2FA disabled successfully" }
   }
}

export const sendResetPasswordCode  =async (email: string) => {
  const response = await api.post(`/auth/send-reset-password-code`, {email});
   return response.data;
}

export const verifyResetPasswordCodeAndReset   =async (email: string, code:string, newPassword: string) => {
  const response = await api.post(`/auth/verify-reset-password-code`,{ email, code, newPassword });
   return response.data;
}