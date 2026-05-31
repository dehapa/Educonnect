import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedWidgets = async () => {
  try {
    const widgetsRef = collection(db, 'widgets');

    // Optional: clear existing home widgets to avoid duplicates
    const q = query(widgetsRef, where('pageId', '==', 'home'));
    const existing = await getDocs(q);
    for (const docSnapshot of existing.docs) {
      await deleteDoc(docSnapshot.ref);
    }
    console.log('Cleared existing home widgets.');

    const newWidgets = [
      {
        pageId: "home",
        area: "top_header",
        type: "hero",
        order: 0,
        title: "Main Hero Banner",
        heroTitle: "Welcome to EduConnect",
        heroSubtitle: "Find the best institutions, courses, and jobs to accelerate your career.",
        heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        pageId: "home",
        area: "main_content",
        type: "grid",
        order: 1,
        title: "Featured Institutions",
        gridCategory: "institutions",
        gridCount: 6,
        gridFilter: "latest",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        pageId: "home",
        area: "main_content",
        type: "grid",
        order: 2,
        title: "Latest Jobs",
        gridCategory: "jobs",
        gridCount: 6,
        gridFilter: "latest",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        pageId: "home",
        area: "left_sidebar",
        type: "ad",
        order: 0,
        title: "Left Sidebar Ad",
        adPlacement: "sidebar_square",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        pageId: "home",
        area: "right_sidebar",
        type: "network-feed",
        order: 0,
        title: "Community Feed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const widget of newWidgets) {
      await addDoc(widgetsRef, widget);
      console.log(`Added widget: ${widget.title}`);
    }

    console.log('Homepage widgets seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding widgets:', error);
    process.exit(1);
  }
};

seedWidgets();
