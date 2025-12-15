import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "./api";

interface User {
  id: number;
  nome: string;
  email: string;
  role: "student" | "teacher";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, ...userData } = response.data;

      // Store data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return response.data;
    } catch (error: any) {
      let errorMessage = "Erro ao fazer login. Tente novamente mais tarde.";
      if (error.response?.status === 401) {
        errorMessage = "Email ou senha inválidos";
      } else if (error.response?.status === 404) {
        errorMessage = "Usuário não encontrado";
      }
      throw new Error(errorMessage);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string
  ) => {
    try {
      const response = await authAPI.register(name, email, password, role);
      const userData = {
        ...response.data,
        role,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(
          "Dados inválidos. Verifique as informações fornecidas."
        );
      } else if (error.response?.status === 409) {
        throw new Error("Email já cadastrado");
      }
      throw new Error("Erro ao realizar cadastro. Tente novamente mais tarde.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  if (loading) {
    return <div>Carregando...</div>; // Ou um componente de loading
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
