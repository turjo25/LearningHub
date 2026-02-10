import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const register = async (userData) => {
    const data = await registerUser(userData);
    if (data?.user_id) {
      setUser({
        id: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,
      });
    }
    return data;
  };

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res?.user ?? null);
    return res;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = "/login";
  };

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        login,
        logout,
        register,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
