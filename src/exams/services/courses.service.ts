import { db } from "@/app/firebase";
import { collection, getDocs, query } from "firebase/firestore";



export const getCourses = async (): Promise<string[]> => {
  try {
    // Leer desde la colección `courses` (documentos con campo `courseName`)
    const q = query(collection(db, "courses"));
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