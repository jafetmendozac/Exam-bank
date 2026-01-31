import { db } from "@/app/firebase"
import { collection, addDoc } from "firebase/firestore"

interface Teacher {
    teacherName: string
    email: string
}

const teachers : Teacher[] = [
    { teacherName: "Edwin Raúl Mendoza Torres", email: "emendoza@unitru.edu.pe" },
    { teacherName: "Iris Áurea Cruz Florián", email: "icruz@unitru.edu.pe" },
    { teacherName: "Yosip Urquizo", email: "yurquizo@unitru.edu.pe" },
    { teacherName: "Jorge Gutierrez Gutierrez", email: "jgutierrez@unitru.edu.pe" },
    { teacherName: "José Luis Peralta Luján", email: "jperalta@unitru.edu.pe" },
    { teacherName: "Ricardo Manuel Guevara Ruiz", email: "rguevara@unitru.edu.pe" },
    { teacherName: "José G. Cruz Silva", email: "jcruz@unitru.edu.pe" },
    { teacherName: "Carlos Enrique Castillo Diestra", email: "ccastillod@unitru.edu.pe" },
    { teacherName: "Anthony Gomez Morales", email: "agomez@unitru.edu.pe" },
    { teacherName: "Jorge Alvarado", email: "jalvarado@unitru.edu.pe" },
    { teacherName: "Liz Sofia Pedro Huaman", email: "lpedro@unitru.edu.pe" },
    { teacherName: "Celestino Medardo Quispe Varón", email: "cmquispe@unitru.edu.pe" },
    { teacherName: "Jorge David Bravo Escalante", email: "jbravo@unitru.edu.pe" },
    { teacherName: "Wilmer Apaza", email: "wapaza@unitru.edu.pe" },
    { teacherName: "Lourdes Cajachuan", email: "lcajachuan@unitru.edu.pe" },
    { teacherName: "José A. Rodriguez Melquiades", email: "jrodriguez@unitru.edu.pe" },
    { teacherName: "Yenny Sifuentes Díaz", email: "ysifuentes@unitru.edu.pe" },
]

export const seedTeachers = async () => {
  try {
    const ref = collection(db, "teachers")
    for (const teacher of teachers) {
      await addDoc(ref, teacher)
    }
    alert("✅ Docentes cargados en Firestore")

  } catch (error) {
    console.error("Error al cargar los docentes:", error)
  }
}

