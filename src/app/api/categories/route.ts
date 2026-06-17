import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, requireAuth } from "@/lib/api-helpers";

const CategoriesCreateSchema = z.object({
    name: z.string().min(2).max(100),
    boardId: z.string().min(1),
    color: z.string().nullable().optional(),
});

export async function POST(req: Request) {
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = CategoriesCreateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid data", 400);

    try {
        const board = await prisma.board.findUnique({
            where: { id: parsed.data.boardId },
        });
        if (!board) return apiError("Board not found", 404);

        const category = await prisma.category.create({
            data: { ...parsed.data },
        });
        return NextResponse.json(category, { status: 201 });
    } catch {
        return apiError("Failed to create category", 500);
    }
}

export async function GET(req: Request) {
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get("boardId");
    if (!boardId) return apiError("boardId is required", 400);

    const categories = await prisma.category.findMany({
        where: { boardId },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
}
