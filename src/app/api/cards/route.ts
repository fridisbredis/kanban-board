import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, requireAuth } from "@/lib/api-helpers";

const CardCreateSchema = z.object({
    title: z.string().min(1).max(100),
    columnId: z.string().min(1),
});

export async function POST(req: Request) {
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = CardCreateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid data", 400);

    try {
        const cardsInColumn = await prisma.card.count({ where: { columnId: parsed.data.columnId } });
        const card = await prisma.card.create({
            data: { ...parsed.data, order: cardsInColumn },
        });
        return NextResponse.json(card, { status: 201 });
    } catch {
        return apiError("Failed to create card", 500);
    }
}
