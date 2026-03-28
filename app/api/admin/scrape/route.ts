import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { scrapeAirbnbListing } from "@/lib/scrape-airbnb";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    // Validate it looks like an Airbnb URL
    if (!url.includes("airbnb")) {
      return NextResponse.json({ error: "URL Airbnb invalide" }, { status: 400 });
    }

    const data = await scrapeAirbnbListing(url);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur lors du scraping" }, { status: 500 });
  }
}
