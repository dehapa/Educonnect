import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function GET() {
  try {
    // Delete existing home page if it exists to overwrite with our ready-made one
    const q = query(collection(db, "pages"), where("slug", "==", "home"));
    const snapshot = await getDocs(q);
    
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(docSnapshot.ref);
    }

    const homePage = {
      title: "Home",
      slug: "home",
      description: "The official home page for EduConnect - Find jobs, explore institutions, and connect.",
      isTemplate: false,
      layout: "wide",
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components: [
        {
          id: "comp-search",
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
          id: "comp-institutions",
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
          id: "comp-jobs",
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

    const docRef = await addDoc(collection(db, "pages"), homePage);
    return NextResponse.json({ message: "Ready-made homepage injected successfully", id: docRef.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
