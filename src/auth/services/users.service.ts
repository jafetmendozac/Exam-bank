import { db } from "@/app/firebase";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: "user" | "admin";
    status: "active" | "banned";
    createdAt: Date;
    lastLogin?: Date;
    emailVerified?: boolean;
}

export interface UserStats {
    uploadsCount: number;
    downloadsCount: number;
    ratingsCount: number;
    approvedExamsCount: number;
}

/**
 * Crear usuario en Firestore si no existe (usado en AuthProvider)
 */
export const createUserIfNotExists = async (
    uid: string,
    email: string,
    displayName?: string,
    photoURL?: string
): Promise<void> => {
    // ✅ Validar que uid sea string válido
    if (!uid || typeof uid !== 'string') {
        console.error("❌ UID inválido:", uid);
        return;
    }

    try {
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Usuario no existe, crearlo
            await setDoc(userRef, {
                email,
                displayName: displayName || email.split("@")[0],
                photoURL: photoURL || null,
                role: "user", // Por defecto
                status: "active",
                emailVerified: true,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });

            console.log("✅ Usuario creado en Firestore:", uid);
        } else {
            // Usuario existe, actualizar último login
            await updateDoc(userRef, {
                lastLogin: serverTimestamp(),
            });

            console.log("✅ Último login actualizado:", uid);
        }
    } catch (error) {
        console.error("Error al crear/actualizar usuario:", error);
        throw error;
    }
};

/**
 * Obtener todos los usuarios (solo admins)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
    const snapshot = await getDocs(collection(db, "users"));

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email || "",
            displayName: data.displayName || data.name || "",
            photoURL: data.photoURL,
            role: data.role || "user",
            status: data.status || "active",
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate(),
            emailVerified: data.emailVerified ?? true,
        };
    });
};

/**
 * Obtener un usuario por UID
 */
export const getUserByUid = async (uid: string): Promise<UserProfile | null> => {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
        return null;
    }

    const data = userDoc.data();
    return {
        uid: userDoc.id,
        email: data.email || "",
        displayName: data.displayName || data.name || "",
        photoURL: data.photoURL,
        role: data.role || "user",
        status: data.status || "active",
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate(),
        emailVerified: data.emailVerified ?? true,
    };
};

/**
 * Obtener estadísticas de un usuario
 */
export const getUserStats = async (uid: string): Promise<UserStats> => {
    // Uploads
    const uploadsQuery = query(
        collection(db, "exams"),
        where("userId", "==", uid)
    );
    const uploadsSnapshot = await getDocs(uploadsQuery);
    const uploadsCount = uploadsSnapshot.size;

    // Exámenes aprobados
    const approvedQuery = query(
        collection(db, "exams"),
        where("userId", "==", uid),
        where("status", "==", "approved")
    );
    const approvedSnapshot = await getDocs(approvedQuery);
    const approvedExamsCount = approvedSnapshot.size;

    // Downloads
    let downloadsCount = 0;
    try {
        const downloadsQuery = query(
            collection(db, "downloadLogs"),
            where("userId", "==", uid)
        );
        const downloadsSnapshot = await getDocs(downloadsQuery);
        downloadsCount = downloadsSnapshot.size;
    } catch (error) {
        console.warn("No downloadLogs collection", error);
    }

    // Ratings
    let ratingsCount = 0;
    try {
        const ratingsQuery = query(
            collection(db, "ratings"),
            where("userId", "==", uid)
        );
        const ratingsSnapshot = await getDocs(ratingsQuery);
        ratingsCount = ratingsSnapshot.size;
    } catch (error) {
        console.warn("No ratings collection", error);
    }

    return {
        uploadsCount,
        downloadsCount,
        ratingsCount,
        approvedExamsCount,
    };
};

/**
 * Actualizar rol de usuario (admin only)
 */
export const updateUserRole = async (
    uid: string,
    role: "user" | "admin"
): Promise<void> => {
    await updateDoc(doc(db, "users", uid), {
        role,
    });
};

/**
 * Actualizar estado de usuario (admin only)
 */
export const updateUserStatus = async (
    uid: string,
    status: "active" | "banned"
): Promise<void> => {
    await updateDoc(doc(db, "users", uid), {
        status,
    });
};

/**
 * Eliminar usuario (admin only)
 * NOTA: Esto solo elimina el documento de Firestore.
 * Para eliminar de Firebase Auth, necesitas Cloud Functions.
 */
export const deleteUserDocument = async (uid: string): Promise<void> => {
    await deleteDoc(doc(db, "users", uid));
};

/**
 * Buscar usuarios por email o nombre
 */
export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
    const allUsers = await getAllUsers();

    if (!searchTerm.trim()) {
        return allUsers;
    }

    const term = searchTerm.toLowerCase();

    return allUsers.filter((user) => {
        const email = user.email.toLowerCase();
        const name = (user.displayName || "").toLowerCase();

        return email.includes(term) || name.includes(term);
    });
};

/**
 * Filtrar usuarios por role
 */
export const getUsersByRole = async (
    role: "user" | "admin"
): Promise<UserProfile[]> => {
    const q = query(collection(db, "users"), where("role", "==", role));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email || "",
            displayName: data.displayName || data.name || "",
            photoURL: data.photoURL,
            role: data.role || "user",
            status: data.status || "active",
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate(),
            emailVerified: data.emailVerified ?? true,
        };
    });
};

/**
 * Filtrar usuarios por status
 */
export const getUsersByStatus = async (
    status: "active" | "banned"
): Promise<UserProfile[]> => {
    const q = query(collection(db, "users"), where("status", "==", status));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email || "",
            displayName: data.displayName || data.name || "",
            photoURL: data.photoURL,
            role: data.role || "user",
            status: data.status || "active",
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate(),
            emailVerified: data.emailVerified ?? true,
        };
    });
};