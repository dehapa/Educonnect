import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";

export async function POST(request) {
  try {
    const { searchQuery, location, isInternational } = await request.json();

    if (!searchQuery) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    
    if (!SERPAPI_KEY) {
      return NextResponse.json({ 
        error: "SERPAPI_KEY is missing in your .env.local file. Please sign up at https://serpapi.com for a free API key." 
      }, { status: 400 });
    }

    // Build the query
    let q = searchQuery;
    if (location) {
      q += ` in ${location}`;
    }

    // Fetch from SerpApi Google Jobs engine
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.append("engine", "google_jobs");
    url.searchParams.append("q", q);
    url.searchParams.append("api_key", SERPAPI_KEY);
    
    if (isInternational) {
      // Optional: adjust gl/hl parameters for international searches if needed
      // url.searchParams.append("gl", "us");
    } else {
      url.searchParams.append("gl", "in"); // Default to India
    }

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    const jobsResult = data.jobs_results || [];
    let ingestedJobs = [];
    let ingestedCount = 0;
    let skippedCount = 0;

    for (const job of jobsResult) {
      // Check if job already exists based on title and company
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef, 
        where("title", "==", job.title), 
        where("companyName", "==", job.company_name)
      );
      
      const existingJobs = await getDocs(q);
      
      if (existingJobs.empty) {
        // Create new job
        const jobData = {
          title: job.title,
          companyName: job.company_name,
          location: job.location || location || "Remote",
          description: job.description || "No description provided.",
          salaryRange: job.detected_extensions?.salary || "Not Disclosed",
          type: job.detected_extensions?.schedule_type || "Full-time",
          postedAt: Timestamp.now(),
          employerId: "SYSTEM_CRAWLER",
          applyLink: job.apply_options?.[0]?.link || job.related_links?.[0]?.link || null,
          source: "SerpApi",
          companyLogo: job.thumbnail || null
        };
        const docRef = await addDoc(jobsRef, jobData);
        ingestedJobs.push({ id: docRef.id, ...jobData });
        ingestedCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${ingestedCount} jobs. Skipped ${skippedCount} duplicates.`,
      ingested: ingestedCount,
      jobs: ingestedJobs
    });

  } catch (error) {
    console.error("Job scraping error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
