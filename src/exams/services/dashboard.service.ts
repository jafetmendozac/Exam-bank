import { db } from "@/app/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import type { Exam } from "./exams.service";

// ============================================
// CONFIGURACIÓN DEL CACHE
// ============================================

const CACHE_KEY = "dashboard_stats_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CachedStats {
  totalExams: number;
  totalUsers: number;
  thisMonthExams: number;
  userUploads: number;
  userDownloads: number;
  timestamp: number;
}

/**
 * Leer stats del cache
 */
const getCachedStats = (): CachedStats | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedStats;
    const now = Date.now();

    // Si el cache es muy viejo (>5 min), ignorarlo
    if (now - data.timestamp > CACHE_DURATION) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error al leer cache:", error);
    return null;
  }
};

/**
 * Guardar stats en cache
 */
const setCachedStats = (stats: Partial<Omit<CachedStats, "timestamp">>) => {
  try {
    const current = getCachedStats();
    const data: CachedStats = {
      totalExams: stats.totalExams ?? current?.totalExams ?? 0,
      totalUsers: stats.totalUsers ?? current?.totalUsers ?? 0,
      thisMonthExams: stats.thisMonthExams ?? current?.thisMonthExams ?? 0,
      userUploads: stats.userUploads ?? current?.userUploads ?? 0,
      userDownloads: stats.userDownloads ?? current?.userDownloads ?? 0,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error al guardar cache:", error);
  }
};

/**
 * Limpiar cache manualmente
 */
export const refreshDashboardCache = () => {
  localStorage.removeItem(CACHE_KEY);
  console.log("🔄 Cache del dashboard limpiado");
};

// ============================================
// FUNCIONES DEL DASHBOARD
// ============================================

/**
 * Obtener total de exámenes
 */
export const getTotalExamsCount = async (): Promise<number> => {
  // 1. Intentar cache
  const cached = getCachedStats();
  if (cached) {
    console.log("📊 Total exams desde cache (0 reads)");
    return cached.totalExams;
  }

  // 2. Leer de Firestore
  try {
    console.log("⚠️ Leyendo total exams de Firestore");
    const snapshot = await getDocs(collection(db, "exams"));
    const count = snapshot.size;

    // 3. Guardar en cache
    setCachedStats({ totalExams: count });

    return count;
  } catch (error) {
    console.error("Error al obtener total de exámenes:", error);
    return 0;
  }
};

/**
 * Obtener exámenes del mes actual
 */
export const getThisMonthExamsCount = async (): Promise<number> => {
  // 1. Intentar cache
  const cached = getCachedStats();
  if (cached) {
    console.log("📊 This month exams desde cache (0 reads)");
    return cached.thisMonthExams;
  }

  // 2. Leer de Firestore
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const q = query(
      collection(db, "exams"),
      where("uploadDate", ">=", Timestamp.fromDate(startOfMonth))
    );

    const snapshot = await getDocs(q);
    const count = snapshot.size;

    // 3. Guardar en cache
    setCachedStats({ thisMonthExams: count });

    return count;
  } catch (error) {
    console.error("Error al obtener exámenes del mes:", error);
    return 0;
  }
};

/**
 * Obtener uploads del usuario actual
 */
export const getUserUploadsCount = async (userId: string): Promise<number> => {
  // Cache por usuario es más complejo, por ahora sin cache
  try {
    const q = query(
      collection(db, "exams"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error al obtener uploads del usuario:", error);
    return 0;
  }
};

/**
 * Obtener descargas del usuario actual
 */
export const getUserDownloadsCount = async (userId: string): Promise<number> => {
  // Nota: Esto requiere que tengas una colección "downloadLogs"
  try {
    const q = query(
      collection(db, "downloadLogs"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    // Si la colección no existe, retornar 0
    console.warn("Colección downloadLogs no existe o error:", error);
    return 0;
  }
};

/**
 * Obtener total de usuarios activos
 */
export const getActiveUsersCount = async (): Promise<number> => {
  // 1. Intentar cache
  const cached = getCachedStats();
  if (cached) {
    console.log("📊 Active users desde cache (0 reads)");
    return cached.totalUsers;
  }

  // 2. Leer de Firestore
  try {
    const snapshot = await getDocs(collection(db, "users"));
    const count = snapshot.size;

    // 3. Guardar en cache
    setCachedStats({ totalUsers: count });

    return count;
  } catch (error) {
    console.error("Error al obtener usuarios activos:", error);
    return 0;
  }
};

/**
 * Obtener exámenes recientes (últimos N exámenes aprobados)
 */
export const getRecentExams = async (limitCount = 5): Promise<Exam[]> => {
  try {
    // Solo exámenes aprobados
    const q = query(
      collection(db, "exams"),
      where("status", "==", "approved")
      // orderBy("uploadDate", "desc"), // Requiere índice
      // limit(limitCount)
    );

    const snapshot = await getDocs(q);

    // Mapear documentos
    const exams = snapshot.docs.map((doc) => {
      const data = doc.data();
      const filePath = data.filePath ||
        (data.fileUrl ? extractPathFromURL(data.fileUrl) : "");

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
        filePath,
        ratingsSummary: data.ratingsSummary || {
          average: 0,
          count: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      } as Exam;
    });

    // Ordenar por fecha (más recientes primero) y limitar
    return exams
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error al obtener exámenes recientes:", error);
    return [];
  }
};

/**
 * Extraer path de URL de Firebase Storage
 */
function extractPathFromURL(url: string): string {
  try {
    const decodedURL = decodeURIComponent(url);
    const match = decodedURL.match(/\/o\/(.+?)\?/);
    return match ? match[1] : "";
  } catch (error) {
    console.error("Error al extraer path de URL:", error);
    return "";
  }
}