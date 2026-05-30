import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

// Category Mapping helper
const mapType = (googleTypes) => {
  if (!googleTypes) return "play-school";
  const typesStr = googleTypes.join(" ").toLowerCase();
  if (typesStr.includes("university") || typesStr.includes("college")) return "university";
  if (typesStr.includes("school")) return "high-school";
  if (typesStr.includes("coaching") || typesStr.includes("education")) return "coaching";
  return "play-school";
};

// Emoji selector
const selectEmoji = (category) => {
  if (category === "university") return "🎓";
  if (category === "high-school") return "🏫";
  if (category === "coaching") return "📚";
  return "🎒";
};

// Address component parser
const parseAddressComponents = (components, defaultState = "Odisha") => {
  let state = defaultState;
  let district = "";
  let townOrBlock = "";
  
  if (components && Array.isArray(components)) {
    for (const comp of components) {
      const types = comp.types || [];
      if (types.includes("administrative_area_level_1")) {
        state = comp.longText || comp.shortText || defaultState;
      } else if (types.includes("administrative_area_level_2")) {
        district = comp.longText || comp.shortText || "";
      } else if (types.includes("locality") || types.includes("sublocality") || types.includes("neighborhood")) {
        if (!townOrBlock) {
          townOrBlock = comp.longText || comp.shortText || "";
        }
      }
    }
  }
  return { state, district, townOrBlock };
};

export async function POST(request) {
  try {
    const { country = "India", state = "Odisha", district, townOrBlock, pinCode, category, customCategory, pageToken } = await request.json();
    if (!district || !category) {
      return NextResponse.json({ error: "Missing district or category" }, { status: 400 });
    }

    const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_KEY) {
      return NextResponse.json({ error: "Google Maps API Key not configured" }, { status: 500 });
    }

    // Map Category to query string
    let categoryQuery = category;
    if (category === "school" || category === "high-school") {
      categoryQuery = "schools";
    } else if (category === "university" || category === "college") {
      categoryQuery = "colleges and universities";
    } else if (category === "coaching") {
      categoryQuery = "coaching centers";
    } else if (category === "kindergarten" || category === "play-school") {
      categoryQuery = "kindergartens and play schools";
    } else if (category === "vocational" || category === "iti") {
      categoryQuery = "industrial training institutes and vocational training centers";
    } else if (category === "computer") {
      categoryQuery = "computer training institutes";
    } else if (category === "sports") {
      categoryQuery = "sports academies and gyms";
    } else if (category === "custom") {
      categoryQuery = customCategory || "institutions";
    }

    // Systematic search query: Category in [PinCode, ] [Town/City, ] [District, ] Odisha, India
    const locationParts = [];
    if (pinCode && pinCode.trim()) locationParts.push(pinCode.trim());
    if (townOrBlock && townOrBlock.trim()) locationParts.push(townOrBlock.trim());
    if (district && district.trim()) locationParts.push(district.trim());
    if (state && state.trim()) locationParts.push(state.trim());
    if (country && country.trim()) locationParts.push(country.trim());

    const textQuery = `${categoryQuery} in ${locationParts.join(", ")}`;
    const url = "https://places.googleapis.com/v1/places:searchText";
    
    const requestBody = { textQuery };
    if (pageToken) {
      requestBody.pageToken = pageToken;
    }


    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.editorialSummary,places.nationalPhoneNumber,places.internationalPhoneNumber,places.regularOpeningHours,places.reviews,places.photos,places.addressComponents,places.googleMapsUri,places.websiteUri,nextPageToken"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Google API Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const places = data.places || [];
    const nextPageToken = data.nextPageToken || null;

    let count = 0;
    const addedListings = [];

    for (const place of places) {
      const type = mapType(place.types);
      const name = place.displayName?.text || "Unnamed Institution";
      const addressData = parseAddressComponents(place.addressComponents, state);
      
      // Get photo resource name
      let photoUrl = "";
      if (place.photos && place.photos.length > 0) {
        photoUrl = place.photos[0].name; 
      }

      const finalDistrict = district || addressData.district || "";
      const finalTown = townOrBlock || addressData.townOrBlock || "";

      const institutionData = {
        id: place.id,
        name: name,
        type: type,
        location: finalTown.toLowerCase(),
        rating: place.rating || 4.2,
        isVerified: false,
        isClaimed: false,
        coursesCount: Math.floor(Math.random() * 15) + 5,
        studentsCount: Math.floor(Math.random() * 1500) + 150,
        description: place.editorialSummary?.text || place.formattedAddress || `${name} in ${finalTown}, ${state}.`,
        address: place.formattedAddress || "",
        phone: place.nationalPhoneNumber || place.internationalPhoneNumber || "",
        website: place.websiteUri || "",
        mapUri: place.googleMapsUri || "",
        photoName: photoUrl,
        regularOpeningHours: place.regularOpeningHours || null,
        reviews: place.reviews ? place.reviews.slice(0, 3) : [],
        country: country,
        state: addressData.state || state,
        district: finalDistrict,
        townOrBlock: finalTown,
        pinCode: pinCode || "",
        logo: selectEmoji(type),
        createdAt: new Date().toISOString()
      };


      const docRef = doc(db, "institutions", place.id);
      await setDoc(docRef, institutionData);
      addedListings.push(institutionData);
      count++;
    }

    return NextResponse.json({
      success: true,
      count,
      nextPageToken,
      listings: addedListings
    });

  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
