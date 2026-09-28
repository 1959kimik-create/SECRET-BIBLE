import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const bookId = Number(id);
  if (!Number.isFinite(bookId) || bookId < 1 || bookId > 66) {
    return NextResponse.json({ error: "invalid book id" }, { status: 400 });
  }

  const fileName = `${String(bookId).padStart(3, "0")}.json`;
  const filePath = path.join(process.cwd(), "data", "bible-text", fileName);

  try {
    const raw = await readFile(filePath, "utf8");
    return new NextResponse(raw, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json(
      {
        error: "book text not found",
        hint: "Run npm run bible:fetch to download 개역한글 (KRV) text into data/bible-text/",
      },
      { status: 404 }
    );
  }
}
