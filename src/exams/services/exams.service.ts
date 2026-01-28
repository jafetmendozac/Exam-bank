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
  QueryConstraint,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { User } from "firebase/auth";

export interface ExamData {
  unidad: string;
  schoolTerm: string;
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
  schoolTerm: string;
  cycle: string;
  unit: string;
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
 * Los archivos se organizan en subcarpetas: exams/unidad/seccion/año/curso/
 */
export const uploadExam = async (user: User, examData: ExamData): Promise<string> => {
  if (!user.uid) {
    throw new Error("Usuario no autenticado");
  }

  // Limpiar nombres para usar en paths (eliminar caracteres especiales)
  const sanitizeForPath = (str: string) => {
    return str.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
  };

  // 1. Subir archivo a Storage con estructura de carpetas: exams/unidad/seccion/año/curso/
  const unidadPath = sanitizeForPath(examData.unidad);
  // const seccionPath = sanitizeForPath(examData.seccion);
  const cursoPath = sanitizeForPath(examData.curso);

  const semesterPath = sanitizeForPath(examData.schoolTerm);

  const filePath = `exams/${cursoPath}/${semesterPath}/${unidadPath}/${Date.now()}_${examData.file.name}`;

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
    cycle: examData.ciclo,
    schoolTerm: examData.schoolTerm,
    unit: examData.unidad,
    section: examData.seccion,
    uploadDate: serverTimestamp(),
    status: "pending" as const,
    downloads: 0,
    fileUrl,
    fileName: examData.file.name,
    fileSize: examData.file.size,
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
      schoolTerm: data.schoolTerm,
      unit: data.unit,
      section: data.section,
      uploadDate: data.uploadDate?.toDate() || new Date(),
      status: data.status || "pending",
      downloads: data.downloads || 0,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.file.size,
      filePath,
    } as Exam;
  });
};

/**
 * Obtiene todos los exámenes (opcionalmente filtrados por ciclo, curso o profesor)
 */
export const getAllExams = async (filters?: {
  cycle?: string;
  course?: string;
  teacher?: string;
  status?: "pending" | "approved" | "rejected";
}): Promise<Exam[]> => {
  const constraints: QueryConstraint[] = [];
  if (filters?.cycle) constraints.push(where("cycle", "==", filters.cycle));
  if (filters?.course) constraints.push(where("course", "==", filters.course));
  if (filters?.teacher) constraints.push(where("teacher", "==", filters.teacher));
  if (filters?.status) constraints.push(where("status", "==", filters.status));

  const q = constraints.length
    ? query(collection(db, "exams"), ...constraints)
    : query(collection(db, "exams"));

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    console.log(data);
    
    const filePath = data.filePath || (data.fileUrl ? extractPathFromURL(data.fileUrl) : "");

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
      uploadDate: data.uploadDate?.toDate() || new Date(),
      status: data.status || "pending",
      downloads: data.downloads || 0,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
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

/**
 * Actualiza los datos de un examen (para administradores durante la revisión)
 */
export const updateExam = async (
  examId: string,
  data: {
    unit?: string;
    section?: string;
    teacher?: string;
    cycle?: string;
    course?: string;
    schoolTerm?: string;
  }
): Promise<void> => {
  const updateData: Record<string, string> = {};

  // Solo incluir campos que fueron proporcionados
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.section !== undefined) updateData.section = data.section;
  if (data.teacher !== undefined) updateData.teacher = data.teacher;
  if (data.cycle !== undefined) updateData.cycle = data.cycle;
  if (data.course !== undefined) updateData.course = data.course;
  if (data.schoolTerm !== undefined) updateData.schoolTerm = data.schoolTerm;

  // Regenerar el título si se actualiza el curso o la unidad
  if (data.course || data.unit) {
    // Obtener los valores actuales si no se proporcionaron
    // const examRef = doc(db, "exams", examId);
    const examDoc = await getDocs(query(collection(db, "exams"), where("__name__", "==", examId)));

    if (!examDoc.empty) {
      const currentData = examDoc.docs[0].data();
      const newCourse = data.course || currentData.course;
      const newUnit = data.unit || currentData.unit;
      updateData.title = `${newCourse} - ${newUnit}`;
    }
  }

  await updateDoc(doc(db, "exams", examId), updateData);
};