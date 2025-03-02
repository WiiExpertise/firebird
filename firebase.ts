// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//  Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZtNXIeSo2PmyEsSHnvElaN-KZg2y_8EA",
  authDomain: "firebird-3fc8c.firebaseapp.com",
  projectId: "firebird-3fc8c",
  storageBucket: "firebird-3fc8c.firebasestorage.app",
  messagingSenderId: "549886041776",
  appId: "1:549886041776:web:2a71af8f75f3d6ecfc6575",
  measurementId: "G-K67DEHWEKF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export the Firestore instance

