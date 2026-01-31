import { db } from "@/app/firebase";
import { collection, getDocs, query } from "firebase/firestore";


export const getTeachers = async (): Promise<string[]> => {
  try {
    const q = query(collection(db, "teachers"));
    const querySnapshot = await getDocs(q);
    const teachers = querySnapshot.docs
      .map((d) => d.data()?.teacherName || "")
      .filter((t) => !!t);

    return Array.from(new Set(teachers)).sort();
  } catch (error) {
    console.error("Error al obtener profesores:", error);
    return [];
  }
};