import { db } from "@/app/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import type { Exam } from "./exams.service";

/**
 * Devuelve el total de exámenes en la colección
 */
export const getTotalExamsCount = async (): Promise<number> => {
  const q = query(collection(db, "exams"));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

/**
 * Devuelve el número de exámenes creados en el mes actual
 */
export const getThisMonthExamsCount = async (): Promise<number> => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const q = query(collection(db, "exams"), where("uploadDate", ">=", start));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

/**
 * Devuelve la cantidad de exámenes subidos por un usuario
 */
export const getUserUploadsCount = async (userId: string): Promise<number> => {
  const q = query(collection(db, "exams"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

/**
 * Devuelve la cantidad de descargas registradas para un usuario.
 * Si no existe una colección de logs de descargas, devuelve 0.
 */
export const getUserDownloadsCount = async (userId: string): Promise<number> => {
  // Intentar leer una colección `downloadLogs` donde cada documento tenga { userId }
  try {
    const downloadsRef = collection(db, "downloadLogs");
    const q = query(downloadsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (err) {
    console.warn("No existe colección downloadLogs, devolviendo 0", err);
    return 0;
  }
};

/**
 * Cuenta usuarios en la colección `users`
 */
export const getActiveUsersCount = async (): Promise<number> => {
  const q = query(collection(db, "users"));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

/**
 * Obtiene los N exámenes más recientes
 */
export const getRecentExams = async (limitCount = 5): Promise<Exam[]> => {
  const q = query(collection(db, "exams"), orderBy("uploadDate", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      course: data.course,
      teacher: data.teacher,
      cycle: data.cycle,
      schoolTerm: data.schoolTerm,
      unit: data.unit,
      section: data.section,
      uploadDate: data.uploadDate?.toDate ? data.uploadDate.toDate() : data.uploadDate || new Date(),
      status: data.status || "pending",
      downloads: data.downloads || 0,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      filePath: data.filePath,
    } as Exam;
  });
};
