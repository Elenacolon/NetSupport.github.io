// ===============================
// FIREBASE.JS
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";

// Authentication
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Firestore
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {

    apiKey: "AIzaSyBNZsRQ41jmQU_CBkjIuKBeo_X2GNozGao",
    authDomain: "net-support-e5f13.firebaseapp.com",
    projectId: "net-support-e5f13",
    storageBucket: "net-support-e5f13.firebasestorage.app",
    messagingSenderId: "929110669044",
    appId: "1:929110669044:web:03d002bde5a5bd9014d0a1",
    measurementId: "G-7RKMLRDWR9"

};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar
export {

    app,
    auth,
    db,

    // Auth
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,

    // Firestore
    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy

};