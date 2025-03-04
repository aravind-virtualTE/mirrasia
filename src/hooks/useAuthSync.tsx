import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthSync = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Listen for changes to the token or isAuthenticated key
      if (event.key === 'token' || event.key === 'isAuthenticated') {
        if (!event.newValue) {
          // Token or authentication removed
          navigate('/login');
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);
};