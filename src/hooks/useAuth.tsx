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