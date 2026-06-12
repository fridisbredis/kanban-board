import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, requireAuth } from "@/lib/api-helpers";

const ColumnCreateSchema = z.object({
    title: z.string().min(2).max(100),
    boardId: z.string().min(1),
});

export async function POST(req: Request) {
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = ColumnCreateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid data", 400);

    try {
        const board = await prisma.board.findUnique({
            where: { id: parsed.data.boardId },
            include: { columns: true },
        });
        if (!board) return apiError("Board not found", 404);

        const column = await prisma.column.create({
            data: { ...parsed.data, order: board.columns.length },
        });
        return NextResponse.json(column, { status: 201 });
    } catch {
        return apiError("Failed to create column", 500);
    }
}
