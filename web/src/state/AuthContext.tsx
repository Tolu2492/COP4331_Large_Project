// React auth state container that keeps the signed-in user and token in sync across the app.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('garnish_token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('garnish_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      setSession(nextUser: User, nextToken: string) {
        setUser(nextUser);
        setToken(nextToken);
        localStorage.setItem('garnish_user', JSON.stringify(nextUser));
        localStorage.setItem('garnish_token', nextToken);
      },
      logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem('garnish_user');
        localStorage.removeItem('garnish_token');
      }
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
