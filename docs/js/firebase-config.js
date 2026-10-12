// Configuration Firebase du projet troc-maison1 (valeurs publiques, non secretes)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAe-Ffxqp2hkvF7bHmHQn6cd_Ukzj42hx4",
  authDomain: "troc-maison1.firebaseapp.com",
  projectId: "troc-maison1",
  storageBucket: "troc-maison1.firebasestorage.app",
  messagingSenderId: "460338479789",
  appId: "1:460338479789:web:8a66a10a3c7c689a37bc24"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "fr";
export const db = getFirestore(app);
