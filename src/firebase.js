
import { initializeApp } from "firebase/app";
import {
  getAuth,
  deleteUser,
  updateProfile,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  // Insira suas credenciais do Firebase aqui
  apiKey: "AIzaSyAgsJmmhEAyhBPaxFZRbGdGT-L97wwEHoI",
  authDomain: "desafio-operand.firebaseapp.com",
  projectId: "desafio-operand",
  storageBucket: "desafio-operand.appspot.com",
  messagingSenderId: "412888438591",
  appId: "1:412888438591:web:a4757a1e72b59c36cc658a",
};

// Inicialize o Firebase
const firebaseApp = initializeApp(firebaseConfig);
// Obtenha os objetos auth e firestore
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const usersColRef = collection(firestore, "users");

// Exporte os módulos do Firebase
export {
  auth,
  firestore,
  deleteUser,
  usersColRef,
  updateProfile,
  createUserWithEmailAndPassword,
};
