import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const mimeBySignature = (bytes: Uint8Array) => {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.slice(0,8).join(",") === "137,80,78,71,13,10,26,10") return "image/png";
  if (String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") return "image/webp";
  if (String.fromCharCode(...bytes.slice(4,12)).includes("ftypavif")) return "image/avif";
  return null;
};

import { hasSupabaseEnv } from "@/lib/env";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        { error: "Para subir imágenes debes configurar las variables de Supabase en .env.local." },
        { status: 400 }
      );
    }
    const { supabase } = await requireAdmin();
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Selecciona una imagen." }, { status: 400 });
    if (file.size > 6 * 1024 * 1024) return NextResponse.json({ error: "La imagen supera el límite de 6 MB." }, { status: 413 });
    const buffer = new Uint8Array(await file.arrayBuffer());
    const detected = mimeBySignature(buffer);
    if (!detected || detected !== file.type) return NextResponse.json({ error: "El formato de imagen no es válido." }, { status: 415 });
    const extension = detected.split("/")[1].replace("jpeg", "jpg");
    const path = `${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-images").upload(path, buffer, { contentType: detected, upsert: false, cacheControl: "31536000" });
    if (error) return NextResponse.json({ error: "No pudimos subir la imagen." }, { status: 500 });
    const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ url: publicUrl.publicUrl, path });
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
}
