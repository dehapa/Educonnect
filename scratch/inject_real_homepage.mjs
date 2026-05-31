import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const homePage = {
  title: "Home",
  slug: "home",
  isTemplate: false,
  layout: "wide",
  status: "published",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  components: [
    {
      type: "grid",
      props: {
        columnCount: 1,
        columns: [
          {
            type: "search_bar",
            props: { placeholder: "Search for institutions, courses, or jobs..." }
          }
        ]
      }
    },
    {
      type: "grid",
      props: {
        columnCount: 1,
        columns: [
          {
            type: "data",
            props: { dataType: "institutions", displayStyle: "grid", limit: 4, title: "Top Institutions" }
          }
        ]
      }
    },
    {
      type: "grid",
      props: {
        columnCount: 1,
        columns: [
          {
            type: "data",
            props: { dataType: "jobs", displayStyle: "grid", limit: 4, title: "Latest Jobs" }
          }
        ]
      }
    }
  ]
};

async function createHomePage() {
  try {
    const docRef = await addDoc(collection(db, "pages"), homePage);
    console.log("Ready-made Home Page created with ID: ", docRef.id);
    process.exit(0);
  } catch (e) {
    console.error("Error adding document: ", e);
    process.exit(1);
  }
}

createHomePage();
