import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function GET() {
  try {
    // Check if it already exists
    const q = query(collection(db, "pages"), where("slug", "==", "premium-home"));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return NextResponse.json({ message: "Template already exists!" }, { status: 200 });
    }

    const templatePage = {
      title: "Premium Homepage Template",
      slug: "premium-home",
      description: "A gorgeous template replicating the dark premium home page layout.",
      isTemplate: true,
      layout: "wide",
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components: [
        {
          id: "comp-1",
          type: "grid",
          props: {
            columnCount: 2,
            columns: [
              {
                type: "data",
                props: { dataType: "institutions", displayStyle: "grid", limit: 3 }
              },
              {
                type: "data",
                props: { dataType: "jobs", displayStyle: "grid", limit: 4 }
              }
            ]
          }
        },
        {
          id: "comp-2",
          type: "grid",
          props: {
            columnCount: 2,
            columns: [
              {
                type: "data",
                props: { dataType: "institutions", displayStyle: "grid", limit: 4 }
              },
              {
                type: "data",
                props: { dataType: "jobs", displayStyle: "grid", limit: 4 }
              }
            ]
          }
        },
        {
          id: "comp-3",
          type: "grid",
          props: {
            columnCount: 2,
            columns: [
              {
                type: "data",
                props: { dataType: "institutions", displayStyle: "list", limit: 3 }
              },
              {
                type: "data",
                props: { dataType: "jobs", displayStyle: "list", limit: 3 }
              }
            ]
          }
        },
        {
          id: "comp-4",
          type: "grid",
          props: {
            columnCount: 2,
            columns: [
              {
                type: "data",
                props: { dataType: "jobs", displayStyle: "list", limit: 3 }
              },
              {
                type: "data",
                props: { dataType: "institutions", displayStyle: "grid", limit: 4 }
              }
            ]
          }
        }
      ]
    };

    const docRef = await addDoc(collection(db, "pages"), templatePage);
    return NextResponse.json({ message: "Template injected successfully", id: docRef.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
