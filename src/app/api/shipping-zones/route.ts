import { NextResponse } from "next/server";
import { getShippingZones } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zones = await getShippingZones(false);
    return NextResponse.json(zones, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to load shipping zones", error instanceof Error ? error.message : "unknown");
    return NextResponse.json([], { status: 500 });
  }
}
