import { db } from "@/app/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    increment,
    getDoc,
    orderBy,
} from "firebase/firestore";

export interface ExamRating {
    id: string;
    examId: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number; // 1-5
    comment: string;
    helpful: number; // Cuántos usuarios marcaron como útil
    createdAt: Date;
    updatedAt?: Date;
}

export interface RatingSummary {
    average: number;
    count: number;
    distribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

/**
 * Crear una nueva calificación
 */
export const createRating = async (
    examId: string,
    userId: string,
    userName: string,
    userEmail: string,
    rating: number,
    comment: string
): Promise<string> => {
    // Validaciones
    if (rating < 1 || rating > 5) {
        throw new Error("La calificación debe estar entre 1 y 5");
    }

    if (!comment.trim()) {
        throw new Error("El comentario es requerido");
    }

    // Verificar que no haya calificado antes
    const existing = await getRatingByUser(examId, userId);
    if (existing) {
        throw new Error("Ya calificaste este examen. Puedes editar tu calificación existente.");
    }

    // Crear rating
    const docRef = await addDoc(collection(db, "ratings"), {
        examId,
        userId,
        userName,
        userEmail,
        rating,
        comment: comment.trim(),
        helpful: 0,
        createdAt: serverTimestamp(),
    });

    // Actualizar summary del examen
    await updateExamRatingSummary(examId);

    return docRef.id;
};

/**
 * Obtener todas las calificaciones de un examen
 */
export const getExamRatings = async (examId: string): Promise<ExamRating[]> => {
    const q = query(
        collection(db, "ratings"),
        where("examId", "==", examId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        examId: doc.data().examId,
        userId: doc.data().userId,
        userName: doc.data().userName,
        userEmail: doc.data().userEmail,
        rating: doc.data().rating,
        comment: doc.data().comment,
        helpful: doc.data().helpful || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
    }));
};

/**
 * Obtener la calificación de un usuario específico para un examen
 */
export const getRatingByUser = async (
    examId: string,
    userId: string
): Promise<ExamRating | null> => {
    const q = query(
        collection(db, "ratings"),
        where("examId", "==", examId),
        where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return {
        id: doc.id,
        examId: doc.data().examId,
        userId: doc.data().userId,
        userName: doc.data().userName,
        userEmail: doc.data().userEmail,
        rating: doc.data().rating,
        comment: doc.data().comment,
        helpful: doc.data().helpful || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
    };
};

/**
 * Actualizar una calificación existente
 */
export const updateRating = async (
    ratingId: string,
    rating: number,
    comment: string
): Promise<void> => {
    // Validaciones
    if (rating < 1 || rating > 5) {
        throw new Error("La calificación debe estar entre 1 y 5");
    }

    if (!comment.trim()) {
        throw new Error("El comentario es requerido");
    }

    await updateDoc(doc(db, "ratings", ratingId), {
        rating,
        comment: comment.trim(),
        updatedAt: serverTimestamp(),
    });

    // Actualizar summary
    const ratingDoc = await getDoc(doc(db, "ratings", ratingId));
    const examId = ratingDoc.data()?.examId;
    if (examId) {
        await updateExamRatingSummary(examId);
    }
};

/**
 * Eliminar una calificación
 */
export const deleteRating = async (ratingId: string): Promise<void> => {
    // Obtener examId antes de eliminar
    const ratingDoc = await getDoc(doc(db, "ratings", ratingId));
    const examId = ratingDoc.data()?.examId;

    // Eliminar rating
    await deleteDoc(doc(db, "ratings", ratingId));

    // Actualizar summary
    if (examId) {
        await updateExamRatingSummary(examId);
    }
};

/**
 * Marcar una calificación como útil
 */
export const markRatingAsHelpful = async (
    ratingId: string,
    userId: string
): Promise<void> => {
    // TODO: Verificar que el usuario no haya marcado como útil antes
    // (requiere colección adicional helpfulVotes)

    await updateDoc(doc(db, "ratings", ratingId), {
        helpful: increment(1),
    });
};

/**
 * Obtener el resumen de calificaciones de un examen
 */
export const getRatingSummary = async (
    examId: string
): Promise<RatingSummary> => {
    const ratings = await getExamRatings(examId);

    if (ratings.length === 0) {
        return {
            average: 0,
            count: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
    }

    // Calcular distribución
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
        distribution[r.rating as keyof typeof distribution]++;
    });

    // Calcular promedio
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;

    return {
        average: Number(average.toFixed(2)),
        count: ratings.length,
        distribution,
    };
};

/**
 * Actualizar el resumen de calificaciones en el documento del examen
 */
export const updateExamRatingSummary = async (
    examId: string
): Promise<void> => {
    const summary = await getRatingSummary(examId);

    await updateDoc(doc(db, "exams", examId), {
        ratingsSummary: summary,
    });
};

/**
 * Obtener todas las calificaciones de un usuario
 */
export const getUserRatings = async (userId: string): Promise<ExamRating[]> => {
    const q = query(
        collection(db, "ratings"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        examId: doc.data().examId,
        userId: doc.data().userId,
        userName: doc.data().userName,
        userEmail: doc.data().userEmail,
        rating: doc.data().rating,
        comment: doc.data().comment,
        helpful: doc.data().helpful || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
    }));
};