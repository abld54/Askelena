export interface ScrapedListing {
  title: string | null;
  description: string | null;
  images: string[];
  pricePerNight: number | null;
  capacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
  lat: number | null;
  lng: number | null;
  city: string | null;
}

function extractMetaContent(html: string, property: string): string | null {
  // Try og: and name= variants
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${property}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        results.push(...parsed);
      } else {
        results.push(parsed);
      }
    } catch {
      // skip invalid JSON-LD
    }
  }
  return results;
}

function extractAllOgImages(html: string): string[] {
  const images: string[] = [];
  const regex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) images.push(decodeHtmlEntities(match[1]));
  }
  // Also try reversed attribute order
  const regex2 = /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/gi;
  while ((match = regex2.exec(html)) !== null) {
    if (match[1] && !images.includes(decodeHtmlEntities(match[1]))) {
      images.push(decodeHtmlEntities(match[1]));
    }
  }
  return images;
}

function extractNumber(text: string | undefined | null): number | null {
  if (!text) return null;
  const match = text.match(/[\d]+(?:[.,]\d+)?/);
  if (match) return parseFloat(match[0].replace(",", "."));
  return null;
}

export async function scrapeAirbnbListing(url: string): Promise<ScrapedListing> {
  const result: ScrapedListing = {
    title: null,
    description: null,
    images: [],
    pricePerNight: null,
    capacity: null,
    bedrooms: null,
    bathrooms: null,
    amenities: [],
    lat: null,
    lng: null,
    city: null,
  };

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract meta tags
    result.title = extractMetaContent(html, "og:title");
    result.description = extractMetaContent(html, "og:description");
    result.images = extractAllOgImages(html);

    // Extract JSON-LD structured data
    const jsonLdItems = extractJsonLd(html);

    for (const item of jsonLdItems) {
      const type = item["@type"] as string | string[] | undefined;
      const types = Array.isArray(type) ? type : [type];

      if (types.some((t) => ["LodgingBusiness", "Product", "Hotel", "House", "Apartment", "VacationRental", "Accommodation"].includes(t || ""))) {
        // Title & description
        if (!result.title && item.name) result.title = String(item.name);
        if (!result.description && item.description) result.description = String(item.description);

        // Price
        if (item.offers) {
          const offers = item.offers as Record<string, unknown>;
          const price = offers.price ?? offers.lowPrice ?? offers.highPrice;
          if (price) result.pricePerNight = extractNumber(String(price));
        }
        if (item.priceRange) {
          const p = extractNumber(String(item.priceRange));
          if (p && !result.pricePerNight) result.pricePerNight = p;
        }

        // Location
        if (item.address) {
          const addr = item.address as Record<string, unknown>;
          result.city = (addr.addressLocality as string) || null;
        }
        if (item.geo) {
          const geo = item.geo as Record<string, unknown>;
          result.lat = extractNumber(String(geo.latitude));
          result.lng = extractNumber(String(geo.longitude));
        }

        // Images from JSON-LD
        if (item.image) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image];
          for (const img of imgs) {
            const imgUrl = typeof img === "string" ? img : (img as Record<string, unknown>)?.url;
            if (imgUrl && typeof imgUrl === "string" && !result.images.includes(imgUrl)) {
              result.images.push(imgUrl);
            }
          }
        }

        // Capacity, rooms
        if (item.numberOfRooms) result.bedrooms = extractNumber(String(item.numberOfRooms));
        if (item.occupancy) {
          const occ = item.occupancy as Record<string, unknown>;
          result.capacity = extractNumber(String(occ.maxValue || occ.value));
        }

        // Amenities
        if (item.amenityFeature) {
          const features = Array.isArray(item.amenityFeature) ? item.amenityFeature : [item.amenityFeature];
          for (const f of features) {
            const name = typeof f === "string" ? f : (f as Record<string, unknown>)?.name;
            if (name && typeof name === "string") result.amenities.push(name);
          }
        }
      }
    }

    // Try to extract capacity/bedrooms/bathrooms from text patterns
    if (!result.capacity) {
      const capMatch = html.match(/(\d+)\s*(?:guests?|voyageurs?|personnes?)/i);
      if (capMatch) result.capacity = parseInt(capMatch[1]);
    }
    if (!result.bedrooms) {
      const bedMatch = html.match(/(\d+)\s*(?:bedrooms?|chambres?)/i);
      if (bedMatch) result.bedrooms = parseInt(bedMatch[1]);
    }
    if (!result.bathrooms) {
      const bathMatch = html.match(/(\d+)\s*(?:bathrooms?|salles?\s*de\s*bain)/i);
      if (bathMatch) result.bathrooms = parseInt(bathMatch[1]);
    }

    // Try to extract price from page content
    if (!result.pricePerNight) {
      const priceMatch = html.match(/(?:€|EUR)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:€|EUR)\s*(?:par\s*nuit|\/\s*night|\/\s*nuit)/i);
      if (priceMatch) {
        result.pricePerNight = extractNumber(priceMatch[1] || priceMatch[2]);
      }
    }

    // Try to extract coordinates from page scripts
    if (!result.lat || !result.lng) {
      const latMatch = html.match(/"lat(?:itude)?":\s*(-?[\d.]+)/);
      const lngMatch = html.match(/"l(?:on|ng|ongitude)":\s*(-?[\d.]+)/);
      if (latMatch) result.lat = parseFloat(latMatch[1]);
      if (lngMatch) result.lng = parseFloat(lngMatch[1]);
    }

    // Extract city from title if not found
    if (!result.city && result.title) {
      // Airbnb titles often end with "· City" or "- City"
      const cityMatch = result.title.match(/[·\-–]\s*([^·\-–]+)$/);
      if (cityMatch) result.city = cityMatch[1].trim();
    }
  } catch (error) {
    console.error("Airbnb scraping error:", error);
    // Return partial results
  }

  return result;
}
