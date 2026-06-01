import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";

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

// String Normalization for Deduplication
const normalizeString = (str) => {
  if (!str) return "";
  return str.toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(school|college|university|institute|academy|centre|center|high|secondary|public)/g, "");
};

// Haversine distance (in km)
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
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
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.location"
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
    
    // Pre-fetch existing institutions in this city to optimize deduplication checks
    const q = query(collection(db, "institutions"), where("location", "==", location.toLowerCase()));
    const querySnapshot = await getDocs(q);
    const existingInsts = [];
    querySnapshot.forEach(doc => {
      existingInsts.push({ id: doc.id, ...doc.data() });
    });

    let count = 0;
    let dupCount = 0;

    for (const place of places) {
      const type = mapType(place.types);
      const name = place.displayName?.text || "Unnamed Institution";
      const normalizedName = normalizeString(name);
      const lat = place.location?.latitude || null;
      const lng = place.location?.longitude || null;
      
      // Deduplication Logic
      let isDuplicate = false;
      
      for (const existing of existingInsts) {
        // 1. Exact ID match
        if (existing.id === place.id) {
          isDuplicate = true;
          break;
        }
        
        // 2. Normalized Name match (strict)
        if (existing.normalizedName && existing.normalizedName === normalizedName && normalizedName.length > 3) {
          isDuplicate = true;
          break;
        }
        
        // 3. Geo-Radius match (< 100 meters = 0.1 km) & Same Type
        if (lat && lng && existing.lat && existing.lng) {
          const dist = getDistanceFromLatLonInKm(lat, lng, existing.lat, existing.lng);
          if (dist < 0.1 && existing.type === type) {
            isDuplicate = true;
            break;
          }
        }
      }

      if (isDuplicate) {
        console.log(`[SKIP] Duplicate detected for: ${name}`);
        dupCount++;
        continue;
      }

      const institutionData = {
        id: place.id,
        name: name,
        normalizedName: normalizedName,
        type: type,
        location: location.toLowerCase(),
        lat: lat,
        lng: lng,
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
      
      // Add to local cache to prevent duplicates within the same batch run
      existingInsts.push(institutionData);
      
      console.log(`[DB] Seeding: ${name} (${type})`);
      count++;
    }
    
    console.log(`[SUCCESS] Seeding completed for ${location}. ${count} items updated, ${dupCount} duplicates skipped.`);
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
