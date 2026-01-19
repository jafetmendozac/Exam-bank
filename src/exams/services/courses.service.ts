import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface CourseDoc {
  cycle?: string;
  courseName?: string;
}

export const getCourses = async (): Promise<string[]> => {
  try {
    const ref = collection(db, "courses");
    const snap = await getDocs(ref);

    const courses = snap.docs
      .map((d) => (d.data() as CourseDoc).courseName ?? "")
      .filter((c) => !!c);

    return Array.from(new Set(courses)).sort();
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return [];
  }
};