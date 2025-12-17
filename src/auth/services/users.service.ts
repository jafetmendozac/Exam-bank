import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase";
import type { User } from "firebase/auth";


export const createUserIfNotExists = async (user: User) => {
  if (!user.email || !user.emailVerified) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) return;

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? "",
    photoURL: user.photoURL ?? "",
    provider: user.providerData[0]?.providerId ?? "password",
    createdAt: serverTimestamp(),
  });
};
