import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        title: `${data.name} - Professional Profile Timeline | EduConnect`,
        description: data.bio 
          ? `${data.name}'s verified career timeline and education history. Bio: ${data.bio.substring(0, 120)}`
          : `Explore ${data.name}'s verified educational history milestones, skillset certifications, and employment background on EduConnect.`,
        openGraph: {
          title: `${data.name} | Verified Resume Timeline`,
          description: `View academic achievements and employment history. Verified on the EduConnect Network.`,
        }
      };
    }
  } catch (e) {
    console.error("Error generating metadata for student:", e);
  }
  
  return {
    title: "Student Resume Profile Timeline | EduConnect",
    description: "Explore verified student educational history, skills portfolios, and public timelines.",
  };
}

export default async function StudentLayout({ children, params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let schemaJson = null;
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      schemaJson = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
          "@type": "Person",
          "name": data.name,
          "description": data.bio || "",
          "jobTitle": "Student",
          "knowsAbout": data.skills || []
        }
      };
    }
  } catch (e) {
    console.error("Error generating student profile schema markup:", e);
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
