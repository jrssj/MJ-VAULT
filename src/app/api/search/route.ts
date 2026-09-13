import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";
export async function GET(request: Request) { const q=new URL(request.url).searchParams.get("q")?.trim()??""; if(q.length<2)return NextResponse.json([]); const products=await getProducts({query:q,limit:24}); return NextResponse.json(products,{headers:{"Cache-Control":"public, max-age=30, stale-while-revalidate=120"}}); }
