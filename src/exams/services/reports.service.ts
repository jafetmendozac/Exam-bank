import { db } from "@/app/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

/**
 * Datos tal como se leen desde Firestore
 */
export interface ReportData {
  reportType: string
  examId: string
  subject: string
  description: string
  userId: string
  createdAt: Timestamp
  status: "pending" | "revised"
}

/**
 * Reporte con ID
 */
export interface Report extends ReportData {
  id: string
}

/**
 * Datos necesarios para crear un reporte
 * (sin campos que pone Firestore)
 */
export type CreateReportData = Omit<
  ReportData,
  "createdAt" | "status"
>

/**
 * Crear un nuevo reporte
 */
export const createReport = async (
  data: CreateReportData
): Promise<string> => {
  const docRef = await addDoc(collection(db, "reports"), {
    ...data,
    createdAt: serverTimestamp(),
    status: "pending",
  })

  return docRef.id
}

/**
 * Obtener reportes por examen
 */
export const getReportsByExamId = async (
  examId: string
): Promise<Report[]> => {
  const q = query(
    collection(db, "reports"),
    where("examId", "==", examId)
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Report)
  )
}

/**
 * Obtener todos los reportes (admin)
 */
export const getAllReports = async (): Promise<Report[]> => {
  const snapshot = await getDocs(collection(db, "reports"))

  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Report)
  )
}
