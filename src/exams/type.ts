/// EXAMS.SERVICE ///

export interface ExamData {
  unidad: string;
  semestre: string;
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
  section: string;
  uploadDate: Date;
  status: "pending" | "approved" | "rejected";
  downloads: number;
  fileUrl: string;
  fileName: string;
  fileSize: number,
  filePath: string;
  schoolTerm: string
}

/// EXAMS.COURSE ///


export interface Course {
  courseName: string;
  cycle: string;
}

/// EXAMS.TEACHERS ///