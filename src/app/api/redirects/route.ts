import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirectSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = redirectSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.redirect.findUnique({ where: { fromPath: parsed.data.fromPath } });
  if (existing) return NextResponse.json({ error: "A redirect from this path already exists." }, { status: 409 });

  const created = await prisma.redirect.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
