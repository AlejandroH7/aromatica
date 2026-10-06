import { NextResponse } from "next/server";
import { apiError } from "@/lib/apiError";
import { productService } from "@/server/services/productService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";

  try {
    const products = await productService.search(q);
    return NextResponse.json(products);
  } catch (e) {
    return apiError(e);
  }
}
