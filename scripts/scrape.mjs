import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

// Helper to load environment variables from .env.local
const loadEnv = () => {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf8");
    const env = {};
    envContent.split("\n").forEach(line => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
        env[key] = value;
      }
    });
    return env;
  } catch (e) {
    console.error("Error loading .env.local file:", e.message);
    return process.env;
  }
};

const env = loadEnv();

// Firebase Configuration
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Google Maps Key
const GOOGLE_MAPS_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!firebaseConfig.apiKey || !GOOGLE_MAPS_KEY) {
  console.error("Missing environment variables in .env.local. Make sure Firebase and Google Maps credentials exist.");
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "educonnect");

// Category Mapping helper
const mapType = (googleTypes) => {
  if (!googleTypes) return "play-school";
  const typesStr = googleTypes.join(" ").toLowerCase();
  if (typesStr.includes("university") || typesStr.includes("college")) return "university";
  if (typesStr.includes("school")) return "high-school";
  return "play-school";
};

// Emoji selector
const selectEmoji = (category) => {
  if (category === "university") return "🎓";
  if (category === "high-school") return "🏫";
  return "🎒";
};

async function scrapeAndSeed(location, categoryQuery) {
  console.log(`[START] Querying Google Places API for ${categoryQuery} in ${location}...`);
  
  const textQuery = `${categoryQuery} in ${location}, Odisha`;
  const url = "https://places.googleapis.com/v1/places:searchText";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.types"
      },
      body: JSON.stringify({ textQuery })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google API responded with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const places = data.places || [];
    
    console.log(`[API] Found ${places.length} matching places.`);
    
    let count = 0;
    for (const place of places) {
      const type = mapType(place.types);
      const name = place.displayName?.text || "Unnamed Institution";
      
      const institutionData = {
        id: place.id,
        name: name,
        type: type,
        location: location.toLowerCase(),
        rating: place.rating || 4.2,
        isVerified: false,
        isClaimed: false,
        coursesCount: Math.floor(Math.random() * 15) + 5,
        studentsCount: Math.floor(Math.random() * 1500) + 150,
        description: place.formattedAddress || `${name} in ${location}, Odisha.`,
        logo: selectEmoji(type),
        createdAt: new Date().toISOString()
      };

      // Write to Firestore database
      const docRef = doc(db, "institutions", place.id);
      await setDoc(docRef, institutionData);
      console.log(`[DB] Seeding: ${name} (${type})`);
      count++;
    }
    
    console.log(`[SUCCESS] Seeding completed for ${location}. ${count} items updated.`);
  } catch (error) {
    console.error(`[ERROR] Ingestion failed:`, error.message);
  }
}

// Run scraper for main cities in Odisha
async function main() {
  const cities = ["Bhubaneswar", "Cuttack"];
  const queries = ["schools", "colleges"];

  for (const city of cities) {
    for (const query of queries) {
      await scrapeAndSeed(city, query);
    }
  }
  console.log("[DONE] Scraper script run finished. Exiting...");
  process.exit(0);
}

main();
