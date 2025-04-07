import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the type for the socket, or null when not yet connected
type SocketContextType = Socket | null;

// Create the context with initial value null
const SocketContext = createContext<SocketContextType>(null);

// Hook to use the socket context
export const useSocket = (): SocketContextType => {
  return useContext(SocketContext);
};

// Props type for the provider
interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<SocketContextType>(null);

  useEffect(() => {
    const URL = import.meta.env.VITE_URL || 'http://localhost:5000';
    
    const socketIo = io(URL);
    setSocket(socketIo);

    return () => {
      socketIo.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
