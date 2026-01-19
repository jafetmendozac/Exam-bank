import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface TeacherDoc {
  teacherName?: string;
  email?: string;
}

export const getTeachers = async (): Promise<string[]> => {
  try {
    const ref = collection(db, "teachers");
    const snap = await getDocs(ref);

    const teachers = snap.docs
      .map((d) => (d.data() as TeacherDoc).teacherName ?? "")
      .filter((t) => !!t);

    return Array.from(new Set(teachers)).sort();
  } catch (error) {
    console.error("Error al obtener docentes:", error);
    return [];
  }
};
