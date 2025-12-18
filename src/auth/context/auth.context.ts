import { createContext } from "react";
import type { User } from "firebase/auth";

export interface AuthContextType {
  user: User | null;
  role: "admin" | "alumno" | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});
