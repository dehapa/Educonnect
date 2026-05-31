import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcdG5RGEjCtu1v8QDhtjz-Z9coraqwOmw",
  authDomain: "educonnect-4f54d.firebaseapp.com",
  projectId: "educonnect-4f54d",
  storageBucket: "educonnect-4f54d.firebasestorage.app",
  messagingSenderId: "690885805531",
  appId: "1:690885805531:web:f459881ef075d7067e13fe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateHomeMenu() {
  const q = query(collection(db, "pages"), where("slug", "==", "home"));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, { showInMenu: true });
    console.log("Updated home page to show in menu!");
  } else {
    console.log("Home page not found");
  }
  process.exit(0);
}

updateHomeMenu();
