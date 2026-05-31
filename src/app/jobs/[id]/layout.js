import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const docRef = doc(db, "jobs", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        title: `${data.title} at ${data.employerName} | EduConnect Placements`,
        description: `Apply for ${data.title} in ${data.location} at ${data.employerName}. Salary: ${data.salary || "Not Specified"}. Required skills: ${data.skills ? data.skills.join(", ") : "None"}.`,
        openGraph: {
          title: `${data.title} - ${data.employerName}`,
          description: `Active career placement vacancy. Postings are verified directly on the EduConnect Network.`,
          images: data.companyLogo || data.logo ? [data.companyLogo || data.logo] : [],
        }
      };
    }
  } catch (e) {
    console.error("Error generating metadata for job:", e);
  }
  
  return {
    title: "Job Placement Opportunity | EduConnect",
    description: "Explore employment listings, verify career milestones, and submit resume timelines.",
  };
}

export default async function JobLayout({ children, params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let schemaJson = null;
  try {
    const docRef = doc(db, "jobs", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      schemaJson = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": data.title,
        "description": data.description,
        "datePosted": data.createdAt || new Date().toISOString(),
        "validThrough": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        "employmentType": data.type === "Internship" ? "INTERN" : "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": data.employerName,
          "sameAs": "https://educonnect-sigma-nine.vercel.app"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": data.location || "Odisha",
            "addressRegion": "Odisha",
            "addressCountry": "IN"
          }
        },
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "INR",
          "value": {
            "@type": "QuantitativeValue",
            "value": data.salary || "Negotiable",
            "unitText": "MONTH"
          }
        }
      };
    }
  } catch (e) {
    console.error("Error generating job schema markup:", e);
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
