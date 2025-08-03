import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, UserSession } from '../types/type';
import StoringData from '../store/store';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<UserSession | null>(null);
    const [loading, setloading] = useState<boolean>(true);

    useEffect(() => {
        const getSession = async () => {
            const store = new StoringData();
            try {
                const validastion: UserSession | null = await store.validationsession();
                if (validastion) {
                    setSession(validastion);
                } else {
                    setSession(null);
                }
            } catch (error) {
                console.log(error);
                setSession(null);
            } finally {
                setloading(false);
            }
        };
        getSession();
    }, []);

    const login = async (sessionData: UserSession) => {
        const store = new StoringData();
        await store.saveDataObj('@user', sessionData);
        setSession(sessionData);
    };

    const logout = async () => {
        const store = new StoringData();
        await store.removeData('@user');
        setSession(null);
    };

    const value = {
        session,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};


export default AuthContext;

