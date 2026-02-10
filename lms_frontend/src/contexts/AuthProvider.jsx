import { createContext, useContext, useEffect, useState } from "react";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const register = async (userData) => {
    return await registerUser(userData);
  };

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    localStorage.setItem("token", res.token);
    localStorage.setItem("refresh", res.refresh);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  const loadUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res?.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
