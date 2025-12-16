// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC34RcucPSaKLJ2iPehEydaIS8hrVzkWUQ",
  authDomain: "exam-bank-3b696.firebaseapp.com",
  projectId: "exam-bank-3b696",
  storageBucket: "exam-bank-3b696.firebasestorage.app",
  messagingSenderId: "519599827424",
  appId: "1:519599827424:web:48c6e1af8007fd0028e385",
  measurementId: "G-E0E02TMEWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);