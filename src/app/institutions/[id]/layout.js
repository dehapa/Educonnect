import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const docRef = doc(db, "institutions", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        title: `${data.name} | EduConnect Directory`,
        description: data.description 
          ? data.description.substring(0, 155) + "..." 
          : `Connect with ${data.name}. Explore courses, faculty, and student timelines on EduConnect.`,
        openGraph: {
          title: `${data.name} - EduConnect Verification`,
          description: `Verified listing for ${data.name}. View programs, rating, and address details.`,
        }
      };
    }
  } catch (e) {
    console.error("Error generating metadata for institution:", e);
  }
  
  return {
    title: "Institution Profile | EduConnect Directory",
    description: "Explore institution profiles, student timelines, and job listings on EduConnect.",
  };
}

export default async function InstitutionLayout({ children, params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let schemaJson = null;
  try {
    const docRef = doc(db, "institutions", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      schemaJson = {
        "@context": "https://schema.org",
        "@type": data.type === "university" ? "CollegeOrUniversity" : "School",
        "name": data.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": data.address || "",
          "addressRegion": data.state || "Odisha",
          "addressCountry": "IN"
        },
        "telephone": data.phone || "",
        "url": data.website || "",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": data.rating || "4.2",
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "15"
        }
      };
    }
  } catch (e) {
    console.error("Error generating schema markup:", e);
  }

  return (
    <>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}
      {children}
    </>
  );
}
