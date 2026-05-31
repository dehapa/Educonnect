import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";

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

const institutionsData = [
  { name: "Global Engineering Institute", category: "engineering", location: "Bangalore", rating: 4.8 },
  { name: "Tech Pro College of Engineering", category: "engineering", location: "Hyderabad", rating: 4.5 },
  { name: "Future Innovators Tech", category: "engineering", location: "Pune", rating: 4.6 },
  { name: "Apex Engineering Academy", category: "engineering", location: "Chennai", rating: 4.7 },

  { name: "City Care Nursing College", category: "nursing", location: "Mumbai", rating: 4.9 },
  { name: "LifeSavers Medical Institute", category: "nursing", location: "Delhi", rating: 4.4 },
  { name: "Florence Nightingale Academy", category: "nursing", location: "Kolkata", rating: 4.8 },
  { name: "Healing Hands Nursing School", category: "nursing", location: "Bangalore", rating: 4.6 },

  { name: "St. Xavier's High School", category: "schools", location: "Mumbai", rating: 4.8 },
  { name: "Delhi Public School", category: "schools", location: "Delhi", rating: 4.9 },
  { name: "Green Valley International", category: "schools", location: "Pune", rating: 4.5 },
  { name: "Sunrise Public School", category: "schools", location: "Chennai", rating: 4.3 }
];

const jobsData = [
  { title: "Senior HR Manager", category: "hr", location: "Remote", type: "Full-Time", salary: "$80k - $100k" },
  { title: "HR Business Partner", category: "hr", location: "Bangalore", type: "Full-Time", salary: "$70k - $90k" },
  { title: "Talent Acquisition Specialist", category: "hr", location: "Mumbai", type: "Contract", salary: "$60k - $75k" },
  { title: "HR Coordinator", category: "hr", location: "Delhi", type: "Full-Time", salary: "$45k - $55k" },

  { title: "High School Math Teacher", category: "teaching", location: "Pune", type: "Full-Time", salary: "$50k - $65k" },
  { title: "Primary School English Teacher", category: "teaching", location: "Chennai", type: "Full-Time", salary: "$40k - $50k" },
  { title: "Physics Professor", category: "teaching", location: "Hyderabad", type: "Full-Time", salary: "$80k - $100k" },
  { title: "Online Coding Tutor", category: "teaching", location: "Remote", type: "Part-Time", salary: "$30/hr" }
];

async function generateDummyData() {
  console.log("Generating dummy data...");
  
  // Clear old institutions
  const iSnap = await getDocs(collection(db, "institutions"));
  for (const doc of iSnap.docs) {
    await deleteDoc(doc.ref);
  }
  
  // Clear old jobs
  const jSnap = await getDocs(collection(db, "jobs"));
  for (const doc of jSnap.docs) {
    await deleteDoc(doc.ref);
  }

  // Insert new
  for (const inst of institutionsData) {
    await addDoc(collection(db, "institutions"), {
      ...inst,
      createdAt: new Date().toISOString()
    });
  }

  for (const job of jobsData) {
    await addDoc(collection(db, "jobs"), {
      ...job,
      createdAt: new Date().toISOString()
    });
  }
  
  console.log("Dummy data injected!");
}

async function updateHomePage() {
  console.log("Updating Home Page layout...");
  
  const q = query(collection(db, "pages"), where("slug", "==", "home"));
  const snapshot = await getDocs(q);
  for (const d of snapshot.docs) {
    await deleteDoc(d.ref);
  }
  
  const newHomeLayout = {
    title: "Home",
    slug: "home",
    status: "published",
    layout: "wide",
    isTemplate: false,
    showInMenu: true,
    createdAt: new Date().toISOString(),
    components: [
      {
        type: "hero",
        props: {
          title: "Find Your Dream College or Career",
          subtitle: "Discover top-rated schools, engineering colleges, and job opportunities all in one place.",
          imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070",
          buttonText: "Join Now",
          buttonLink: "/dashboard"
        }
      },
      {
        type: "grid",
        props: {
          columnCount: 1,
          columns: [{ type: "search_bar", props: { placeholder: "Search for institutions, courses, or jobs..." } }]
        }
      },
      {
        type: "grid",
        props: {
          columnCount: 1,
          columns: [{ type: "quick_categories", props: {} }]
        }
      },
      {
        type: "grid",
        props: {
          columnCount: 1,
          columns: [{ type: "data", props: { dataType: "institutions", filterCategory: "engineering", limit: 4, displayStyle: "grid", title: "Top Engineering Colleges" } }]
        }
      },
      {
        type: "grid",
        props: {
          columnCount: 1,
          columns: [{ type: "data", props: { dataType: "institutions", filterCategory: "nursing", limit: 4, displayStyle: "grid", title: "Top Nursing Colleges" } }]
        }
      },
      {
        type: "grid",
        props: {
          columnCount: 1,
          columns: [{ type: "data", props: { dataType: "jobs", filterCategory: "teaching", limit: 4, displayStyle: "grid", title: "Latest Teaching Jobs" } }]
        }
      },
      {
        type: "grid",
        props: {
          columnCount: 1,
          columns: [{ type: "data", props: { dataType: "jobs", filterCategory: "hr", limit: 4, displayStyle: "grid", title: "Latest HR Jobs" } }]
        }
      }
    ]
  };

  await addDoc(collection(db, "pages"), newHomeLayout);
  console.log("Home page layout updated!");
}

async function run() {
  await generateDummyData();
  await updateHomePage();
  process.exit(0);
}

run();
