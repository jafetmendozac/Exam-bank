import { db } from "@/app/firebase"
import { collection, addDoc } from "firebase/firestore"


interface Curso {
  cycle: string
  courseName: string
}

const cursos : Curso[] = [
    { cycle: "I", courseName: "Desarrollo personal" },
    { cycle: "I", courseName: "Lectura crítica y redacción de textos académicos" },
    { cycle: "I", courseName: "Física general" },
    { cycle: "I", courseName: "Algoritmos y programación" },
    { cycle: "I", courseName: "Desarrollo del pensamiento lógico matemático" },
    { cycle: "I", courseName: "Introducción al análisis matemático" },
    { cycle: "I", courseName: "Taller de liderazgo y trabajo en equipo" },

    { cycle: "II", courseName: "Ética, convivencia humana y ciudadanía" },
    { cycle: "II", courseName: "Sociedad cultura y ecología" },
    { cycle: "II", courseName: "Cultura investigativa y pensamiento crítico" },
    { cycle: "II", courseName: "Estructura de datos" },
    { cycle: "II", courseName: "Estadística general" },
    { cycle: "II", courseName: "Análisis matemático" },
    { cycle: "II", courseName: "Taller de manejo de TIC" },

    { cycle: "III", courseName: "Geometría analítica" },
    { cycle: "III", courseName: "Paradigmas de lenguajes de programación" },
    { cycle: "III", courseName: "Estrategias algorítmicas" },
    { cycle: "III", courseName: "Matemática discreta" },
    { cycle: "III", courseName: "Física para ciencia de la computación" },
    { cycle: "III", courseName: "Análisis numérico" },

    { cycle: "IV", courseName: "Computación gráfica" },
    { cycle: "IV", courseName: "Organización de archivos" },
    { cycle: "IV", courseName: "Algoritmos y complejidad" },
    { cycle: "IV", courseName: "Lenguajes formales y autómatas" },
    { cycle: "IV", courseName: "Electrónica para computación" },
    { cycle: "IV", courseName: "Innovación y emprendimiento" },

    { cycle: "V", courseName: "Base de datos I" },
    { cycle: "V", courseName: "Ingeniería de software I" },
    { cycle: "V", courseName: "Inteligencia artificial I" },
    { cycle: "V", courseName: "Compiladores" },
    { cycle: "V", courseName: "Técnicas digitales para computación" },
    { cycle: "V", courseName: "Metodología de la investigación científica" },

    { cycle: "VI", courseName: "Computación gráfica avanzada" },
    { cycle: "VI", courseName: "Base de datos II" },
    { cycle: "VI", courseName: "Ingeniería de software II" },
    { cycle: "VI", courseName: "Inteligencia artificial II" },
    { cycle: "VI", courseName: "Comunicación de datos" },
    { cycle: "VI", courseName: "Arquitectura y organización de computadoras" },

    { cycle: "VII", courseName: "Base de datos avanzada" },
    { cycle: "VII", courseName: "Desarrollo de software" },
    { cycle: "VII", courseName: "Percepción y visión por computadora" },
    { cycle: "VII", courseName: "Redes de computadoras I" },
    { cycle: "VII", courseName: "Sistemas operativos I" },
    { cycle: "VII", courseName: "Gestión de proyectos informáticos" },

    { cycle: "VIII", courseName: "Robótica" },
    { cycle: "VIII", courseName: "Redes de computadoras II" },
    { cycle: "VIII", courseName: "Sistemas operativos II" },
    { cycle: "VIII", courseName: "Prácticas pre-profesionales" },

    { cycle: "IX", courseName: "Interacción humano-computador" },
    { cycle: "IX", courseName: "Tópicos en base de datos" },
    { cycle: "IX", courseName: "Tópicos en ingeniería de software" },
    { cycle: "IX", courseName: "Ingeniería de software avanzada" },
    { cycle: "IX", courseName: "Seguridad informática" },
    { cycle: "IX", courseName: "Proyecto de tesis" },

    { cycle: "X", courseName: "Tópicos en tecnologías inmersivas" },
    { cycle: "X", courseName: "Sistemas de información" },
    { cycle: "X", courseName: "Ética para profesionales en informática" },
    { cycle: "X", courseName: "Proyecto de competencia" },
    { cycle: "X", courseName: "Proyecto integrador" },
    { cycle: "X", courseName: "Tesis" },
]

export const seedCursos = async () => {
  try {
    const ref = collection(db, "courses")

    for (const curso of cursos) {
      await addDoc(ref, curso)
    }

    alert("Firestore poblado correctamente ✅")
  } catch (error) {
    console.error("Error poblando Firestore ❌", error)
  }
}
