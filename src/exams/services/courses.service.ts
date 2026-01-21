// import { db } from "@/app/firebase";
// import { collection, getDocs, query } from "firebase/firestore";



// export const getCourses = async (): Promise<string[]> => {
//   try {
//     // Leer desde la colección `courses` (documentos con campo `courseName`)
//     const q = query(collection(db, "courses"));
//     const querySnapshot = await getDocs(q);
//     const courses = querySnapshot.docs
//       .map((d) => d.data()?.courseName || "")
//       .filter((c) => !!c);

//     return Array.from(new Set(courses)).sort();
//   } catch (error) {
//     console.error("Error al obtener cursos:", error);
//     return [];
//   }
// };

import { db } from "@/app/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface Course {
  courseName: string;
  cycle: string;
}

/**
 * Obtiene los nombres de cursos, opcionalmente filtrados por ciclo
 */
export const getCourses = async (cycle?: string): Promise<string[]> => {
  try {
    const constraints = cycle ? [where("cycle", "==", cycle)] : [];
    const q = constraints.length
      ? query(collection(db, "courses"), ...constraints)
      : query(collection(db, "courses"));
    
    const querySnapshot = await getDocs(q);
    const courses = querySnapshot.docs
      .map((d) => d.data()?.courseName || "")
      .filter((c) => !!c);

    return Array.from(new Set(courses)).sort();
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return [];
  }
};

/**
 * Obtiene todos los cursos con su información de ciclo
 */
export const getAllCoursesWithCycle = async (): Promise<Course[]> => {
  try {
    const q = query(collection(db, "courses"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((d) => ({
      courseName: d.data()?.courseName || "",
      cycle: d.data()?.cycle || "",
    })).filter((c) => !!c.courseName);
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return [];
  }
};