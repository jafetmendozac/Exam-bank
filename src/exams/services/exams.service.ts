import { db, storage } from "@/app/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { User } from "firebase/auth";

export interface ExamData {
  unidad: string;
  semestre: string;
  anio: string;
  seccion: string;
  profesor: string;
  ciclo: string;
  curso: string;
  file: File;
}

export interface Exam {
  id: string;
  userId: string;
  title: string;
  course: string;
  teacher: string;
  cycle: string;
  unit: string;
  year: string;
  section: string;
  uploadDate: Date;
  status: "pending" | "approved" | "rejected";
  downloads: number;
  fileUrl: string;
  fileName: string;
  filePath: string; // Path en Storage (ej: "exams/userId/filename.pdf")
}

/**
 * Sube un examen a Firebase Storage y guarda los metadatos en Firestore
 */
export const uploadExam = async (user: User, examData: ExamData): Promise<string> => {
  if (!user.uid) {
    throw new Error("Usuario no autenticado");
  }

  // 1. Subir archivo a Storage
  const filePath = `exams/${user.uid}/${Date.now()}_${examData.file.name}`;
  const fileRef = ref(storage, filePath);
  await uploadBytes(fileRef, examData.file);
  const fileUrl = await getDownloadURL(fileRef);

  // 2. Crear título del examen
  const title = `${examData.curso} - ${examData.unidad}`;

  // 3. Guardar metadatos en Firestore
  const examDoc = await addDoc(collection(db, "exams"), {
    userId: user.uid,
    title,
    course: examData.curso,
    teacher: examData.profesor,
    cycle: examData.semestre,
    unit: examData.unidad,
    year: examData.anio,
    section: examData.seccion,
    uploadDate: serverTimestamp(),
    status: "pending" as const,
    downloads: 0,
    fileUrl,
    fileName: examData.file.name,
    filePath, // Guardar el path para poder eliminar el archivo después
  });

  return examDoc.id;
};

/**
 * Extrae el path de Storage de una URL de Firebase Storage
 */
const extractPathFromURL = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Las URLs de Firebase Storage tienen el formato: /b/{bucket}/o/{path}
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
    if (pathMatch) {
      return decodeURIComponent(pathMatch[1]);
    }
  } catch {
    // Si no es una URL válida, asumir que ya es un path
  }
  return url;
};

/**
 * Obtiene todos los exámenes de un usuario
 */
export const getUserExams = async (userId: string): Promise<Exam[]> => {
  const q = query(collection(db, "exams"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    // Si filePath no existe (documentos antiguos), extraerlo de fileUrl
    const filePath = data.filePath || (data.fileUrl ? extractPathFromURL(data.fileUrl) : "");

    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      course: data.course,
      teacher: data.teacher,
      cycle: data.cycle,
      unit: data.unit,
      year: data.year,
      section: data.section,
      uploadDate: data.uploadDate?.toDate() || new Date(),
      status: data.status || "pending",
      downloads: data.downloads || 0,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      filePath,
    } as Exam;
  });
};

/**
 * Obtiene una URL de descarga válida para un archivo (regenera el token si es necesario)
 */
export const getExamDownloadURL = async (filePath: string): Promise<string> => {
  const fileRef = ref(storage, filePath);
  return await getDownloadURL(fileRef);
};

/**
 * Elimina un examen (archivo y metadatos)
 */
export const deleteExam = async (examId: string, filePath: string): Promise<void> => {
  // 1. Eliminar archivo de Storage usando el path
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error al eliminar archivo de Storage:", error);
    // Intentar extraer el path de una URL si filePath es una URL
    try {
      const url = new URL(filePath);
      // Extraer el path del bucket: /b/{bucket}/o/{path}
      const pathMatch = url.pathname.match(/\/o\/(.+)$/);
      if (pathMatch) {
        const extractedPath = decodeURIComponent(pathMatch[1]);
        const fileRef = ref(storage, extractedPath);
        await deleteObject(fileRef);
      } else {
        throw error;
      }
    } catch (fallbackError) {
      console.error("Error al eliminar archivo (fallback):", fallbackError);
      throw error;
    }
  }

  // 2. Eliminar documento de Firestore
  await deleteDoc(doc(db, "exams", examId));
};

/**
 * Actualiza el estado de un examen (para administradores)
 */
export const updateExamStatus = async (
  examId: string,
  status: "pending" | "approved" | "rejected"
): Promise<void> => {
  await updateDoc(doc(db, "exams", examId), {
    status,
  });
};
