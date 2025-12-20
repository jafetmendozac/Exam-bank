/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });






import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

const PREMIOS = [500, 300, 150];

export const sistemaBonosReferidorMes = onRequest(async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection("referidores")
      .get();

    const referidores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Ordenar por comisiones (descendente)
    referidores.sort((a, b) => b.comisiones - a.comisiones);

    const top3 = referidores.slice(0, 3);

    const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM

    const resultados = top3.map((ref, index) => ({
      referidorId: ref.id,
      nombre: ref.nombre,
      comisiones: ref.comisiones,
      premio: PREMIOS[index],
      puesto: index + 1,
      mes: mesActual
    }));

    // Guardar resultados
    const batch = admin.firestore().batch();
    resultados.forEach(r => {
      const ref = admin.firestore()
        .collection("bonos_mensuales")
        .doc(`${mesActual}_${r.referidorId}`);
      batch.set(ref, r);
    });

    await batch.commit();

    logger.info("Bonos asignados correctamente", resultados);

    res.status(200).json({
      message: "Bonos del mes calculados",
      resultados
    });

  } catch (error) {
    logger.error("Error calculando bonos", error);
    res.status(500).send("Error al calcular bonos");
  }
});
