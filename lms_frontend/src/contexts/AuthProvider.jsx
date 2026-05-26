import { createContext, useContext, useEffect, useState } from "react";
import { registerUser, loginUser, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider = ({ children }) => {
  // user shape: { user_id, username, email, first_name, last_name, role, avatar_url }
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData || null);
    } catch {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

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

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, register, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
