import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"; 

const firebaseConfig = {
  apiKey: "AIzaSyDG4ncSPu9UrJA706zdNn9X_ujQ0GxnOV0",
  authDomain: "raj-mock-test-portal.firebaseapp.com",
  projectId: "raj-mock-test-portal",
  storageBucket: "raj-mock-test-portal.firebasestorage.app",
  messagingSenderId: "284350441602",
  appId: "1:284350441602:web:49cede8e225019dc6c2c9b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);