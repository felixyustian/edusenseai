import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('edusense_token');
    if (token) {
      authApi.me(token)
        .then(r => setUser(r.data))
        .catch(() => localStorage.removeItem('edusense_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('edusense_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const demoLogin = async () => {
    const { data } = await authApi.demoLogin();
    localStorage.setItem('edusense_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await authApi.register(name, email, password);
    localStorage.setItem('edusense_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('edusense_token');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, demoLogin, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
