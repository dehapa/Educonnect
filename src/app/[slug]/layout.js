import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const q = query(collection(db, "pages"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const pageData = querySnapshot.docs[0].data();
      return {
        title: `${pageData.title || slug} | EduConnect`,
        description: `Explore ${pageData.title || slug} on EduConnect.`,
        openGraph: {
          title: `${pageData.title || slug} - EduConnect`,
          description: `Explore ${pageData.title || slug} on EduConnect.`,
        }
      };
    }
  } catch (e) {
    console.error("Error generating metadata for CMS page:", e);
  }
  
  return {
    title: "EduConnect",
    description: "The educational and employment ecosystem platform of Odisha.",
  };
}

export default function CmsLayout({ children }) {
  return <>{children}</>;
}
