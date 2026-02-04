# Diseño e implementación: `downloadLogs`, extensión de `exams`, índices y seguridad

Este documento explica paso a paso qué haría para implementar el registro de descargas (`downloadLogs`), cómo extender la estructura de `exams`, qué índices compuestos conviene crear y opciones de seguridad (cliente vs servidor). Incluye snippets listos para integrar en el repo.

---

## Objetivo

- Registrar cada descarga de examen para auditoría y métricas.
- Mantener un contador seguro y consistente en cada documento `exams`.
- Extender el esquema de `exams` con metadatos útiles (hash, mime, revisión).
- Sugerir índices compuestos para consultas comunes.
- Proponer reglas y una opción de Cloud Function para evitar abuso.

---

## Esquema propuesto

### Colección `exams` (documento ejemplo)

```json
{
  "userId": "uid123",
  "title": "Algoritmos - Parcial 1",
  "course": "Algoritmos y programación",
  "teacher": "Dr. X",
  "cycle": "2024-1",
  "schoolTerm": "2024-1",
  "unit": "Unidad 2",
  "section": "A",
  "uploadDate": "Timestamp",
  "status": "pending", // pending|approved|rejected
  "downloads": 42,
  "fileUrl": "https://...",
  "fileName": "parcial1.pdf",
  "fileSize": 123456,
  "filePath": "exams/.../file.pdf",
  "mimeType": "application/pdf",
  "fileHash": "sha256:...",
  "approvedAt": null,
  "reviewedBy": null,
  "reportedCount": 0,
  "visibility": "public",
  "tags": ["final","parcial"]
}
```

> Nota: Los campos nuevos (`mimeType`, `fileHash`, `approvedAt`, ...) son opcionales y se pueden añadir incrementalmente cuando proceses uploads o revisiones.

### Colección `downloadLogs` (top-level)

Cada documento registra una descarga. Campos sugeridos:

```json
{
  "examId": "examDocId",
  "userId": "uid123",        // opcional si no autenticado
  "timestamp": "Timestamp",
  "ip": "1.2.3.4",         // opcional, si lo registras server-side
  "userAgent": "..."
}
```

Razonamiento: usar una colección top-level `downloadLogs` facilita queries globales (p. ej. top downloads), y conectar `examId` permite agregaciones.

---

## Implementación cliente (transacción)

Archivo sugerido: `src/exams/services/downloads.service.ts`

Snippet (cliente, Firestore Web v9):

```ts
import { db } from "@/app/firebase";
import {
  collection,
  doc,
  serverTimestamp,
  runTransaction,
  setDoc,
  DocumentReference,
} from "firebase/firestore";

export const logDownload = async (examId: string, userId?: string) => {
  const downloadsColl = collection(db, "downloadLogs");
  const examRef = doc(db, "exams", examId);

  await runTransaction(db, async (tx) => {
    // 1) Crear un log de descarga con ID auto
    const newLogRef = doc(downloadsColl); // create ref
    tx.set(newLogRef, {
      examId,
      userId: userId ?? null,
      timestamp: serverTimestamp(),
    });

    // 2) Incrementar contador de descargas en exam (atomically)
    const examSnap = await tx.get(examRef);
    if (!examSnap.exists()) throw new Error("Exam not found");

    const current = (examSnap.data()?.downloads ?? 0) as number;
    tx.update(examRef, { downloads: current + 1 });
  });
};
```

Notas:
- `runTransaction` asegura que el contador y el log se escriban de forma consistente.
- Un cliente autenticado puede llamar a esta función, pero no impide que alguien abuse (scripts pueden llamar repetidamente).

---

## Opción más segura: Cloud Function (server-side)

Para evitar abuso (falsos logs desde clientes) recomiendo exponer una Cloud Function HTTP o callable `registerDownload` que:

- Valide `context.auth` (si requieres autenticación)
- Compruebe la existencia del `examId`
- Registre el `downloadLog` (incluyendo `ip` y `userAgent` desde el request)
- Actualice `exams.downloads` en una transacción

Ejemplo (TypeScript) - `functions/src/index.ts` (esquema):

```ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const db = admin.firestore();

export const registerDownload = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid || null;
  const examId = data.examId;
  if (!examId) throw new functions.https.HttpsError("invalid-argument", "examId required");

  const examRef = db.collection("exams").doc(examId);
  await db.runTransaction(async (tx) => {
    const examSnap = await tx.get(examRef);
    if (!examSnap.exists) throw new functions.https.HttpsError("not-found", "Exam not found");

    // crear log con ip/userAgent si lo deseas (disponible en context.rawRequest)
    const logsRef = db.collection("downloadLogs");
    await logsRef.add({
      examId,
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      // ip/userAgent: extraer de context.rawRequest.headers
    });

    const current = (examSnap.data()?.downloads ?? 0) as number;
    tx.update(examRef, { downloads: current + 1 });
  });

  return { ok: true };
});
```

Ventajas:
- Puedes aplicar validaciones/ratelimit en el servidor.
- Puedes extraer IP y UA confiables desde la request.

---

## Reglas de seguridad (ejemplos)

Puntos clave:
- `exams` solo puede ser eliminado por su `userId` o por admin.
- `downloadLogs` puede ser append-only y solo por autenticados (si usas cliente); si usas Cloud Function, restringe `create` de `downloadLogs` sólo a admin/service account.

Ejemplos (rules.firestore):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /exams/{examId} {
      allow read: if true; // ajustar según visibility
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId || isAdmin();
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId || isAdmin();
    }

    match /downloadLogs/{docId} {
      // Si permites escritura desde cliente:
      allow create: if request.auth != null;
      allow read: if isAdmin();
      allow delete: if false;
    }

    function isAdmin() {
      return request.auth.token.role == 'admin';
    }
  }
}
```

> Si usas Cloud Functions para escribir `downloadLogs`, bloquea `create` a no-admins y evita escrituras directas desde cliente.

---

## Índices compuestos recomendados

Basado en consultas observadas (filtrar por `course`, `cycle`, `teacher`, `status` y ordenar por `uploadDate`):

Ejemplo `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "exams",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "course", "order": "ASCENDING" },
        { "fieldPath": "uploadDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "exams",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "cycle", "order": "ASCENDING" },
        { "fieldPath": "uploadDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "exams",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "uploadDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Despliegue de índices con Firebase CLI:

```bash
# en el root del proyecto (donde está firebase.json)
firebase deploy --only firestore:indexes
```

O subir `firestore.indexes.json` y usar `firebase deploy`.

---

## Migración / pasos a ejecutar (orden sugerido)

1. Crear `src/exams/services/downloads.service.ts` (cliente) y pruebas locales.
2. Añadir los nuevos campos opcionales en los lugares donde subes exámenes (`exams.service.uploadExam`) — calcular `fileHash` y `mimeType` si es posible. No es obligatorio para empezar.
3. Decidir estrategia anti-abuso:
   - Rápido: permitir `downloadLogs` desde cliente autenticado y confiar en normas (más fácil pero menos seguro).
   - Recomendado: crear Cloud Function `registerDownload` para registrar descargas y denegar escritura directa a `downloadLogs` desde cliente.
4. Añadir reglas de seguridad actualizadas.
5. Añadir índices compuestos recomendados.
6. Hacer pruebas end-to-end: subir examen, descargar (llamar `logDownload` o `registerDownload`), verificar incremento y aparición en `downloadLogs`.

---

## Comandos útiles

- Instalar dependencias en `functions/` (si implementas función):

```bash
cd functions
npm install
```

- Emular funciones localmente:

```bash
firebase emulators:start --only functions
```

- Desplegar funciones e índices:

```bash
firebase deploy --only functions
firebase deploy --only firestore:indexes
```

---

## Consideraciones prácticas / límites

- Firestore no es ideal para escrituras de alta frecuencia por documento (hot-spot). El patrón de contador con `downloads` en un único documento puede sufrir límites si hay muchísimas descargas simultáneas. Alternativas: sharded counters o usar BigQuery/Analytics para métricas a gran escala.
- Para evitar falsos registros de descargas, server-side es más fiable.
- Guardar IPs puede tener implicaciones de privacidad; documenta y respeta políticas y leyes aplicables.

---

## ¿Qué voy a crear si me lo pides?

- `src/exams/services/downloads.service.ts` con `logDownload` (transacción cliente).
- Ejemplo de Cloud Function `registerDownload` en `functions/src/index.ts` (si eliges servidor).
- `firestore.indexes.json` con índices propuestos.
- Ejemplo de reglas Firestore (snippet) para integrar en `firestore.rules`.
- Un pequeño README (este archivo) explicando pasos de despliegue y pruebas.

---

Si quieres que implemente la opción A (cliente + índices + reglas) o la opción B (Cloud Function + bloqueo de escrituras cliente), dime cuál y lo implemento ahora con archivos y ejemplos directamente en el repo.
