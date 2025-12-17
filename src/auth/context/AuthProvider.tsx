import { useEffect, useState } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { AuthContext } from "./auth.context";
import { createUserIfNotExists } from "../services/users.service";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (
        firebaseUser &&
        firebaseUser.emailVerified &&
        firebaseUser.email?.endsWith("@unitru.edu.pe")
      ) {
        try {
          await createUserIfNotExists(firebaseUser);
        } catch (err) {
          console.error("Firestore error:", err);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
