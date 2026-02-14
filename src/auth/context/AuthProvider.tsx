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
  const [role, setRole] = useState<"admin" | "user" | null>(null); // ✅ Cambié "alumno" → "user"
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
        // // ✅ CORREGIDO: Pasar parámetros separados
        // await createUserIfNotExists(
        //   firebaseUser.uid,
        //   firebaseUser.email,
        //   firebaseUser.displayName || undefined,
        //   firebaseUser.photoURL || undefined
        // );

        // ✅ OPTIMIZADO: Solo actualizar lastLogin 1 vez al día
        const lastLoginKey = `lastLogin_${firebaseUser.uid}`;
        const lastUpdate = localStorage.getItem(lastLoginKey);
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 horas

        // Solo actualizar si pasaron más de 24 horas
        if (!lastUpdate || now - parseInt(lastUpdate) > oneDayInMs) {
          await createUserIfNotExists(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName || undefined,
            firebaseUser.photoURL || undefined
          );
          localStorage.setItem(lastLoginKey, now.toString());
        }

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