// import { useEffect, useState } from "react";
// import { onIdTokenChanged, type User } from "firebase/auth";
// import { auth } from "@/app/firebase";
// import { AuthContext } from "./auth.context";
// import { createUserIfNotExists } from "../services/users.service";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/app/firebase";

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [role, setRole] = useState<"admin" | "alumno" | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
//       setUser(firebaseUser);

//       if (
//         firebaseUser &&
//         firebaseUser.emailVerified &&
//         firebaseUser.email?.endsWith("@unitru.edu.pe")
//       ) {
//         try {
//           await createUserIfNotExists(firebaseUser);
//         } catch (err) {
//           console.error("Firestore error:", err);
//         }
//       }

//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, role, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
import { useEffect, useState } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { AuthContext } from "./auth.context";
import { createUserIfNotExists } from "../services/users.service";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "alumno" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      if (
        firebaseUser.emailVerified &&
        firebaseUser.email?.endsWith("@unitru.edu.pe")
      ) {
        // 1️⃣ Crear usuario si no existe
        await createUserIfNotExists(firebaseUser);

        // 2️⃣ Leer rol desde Firestore
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));

        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
