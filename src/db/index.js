import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgsJmmhEAyhBPaxFZRbGdGT-L97wwEHoI",
  authDomain: "desafio-operand.firebaseapp.com",
  projectId: "desafio-operand",
  storageBucket: "desafio-operand.appspot.com",
  messagingSenderId: "412888438591",
  appId: "1:412888438591:web:a4757a1e72b59c36cc658a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const usersColRef = collection(db, "users");
export default usersColRef;
