import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, requireAuth } from "@/lib/api-helpers";

const BoardCreateSchema = z.object({
    title: z.string().min(2).max(100),
    description: z.string().max(200).optional(),
});

export async function POST(req: Request) {
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = BoardCreateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid data", 400);

    try {
        const board = await prisma.board.create({
            data: {
                ...parsed.data,
                ownerId: userId,
                columns: {
                    create: [
                        { title: "To Do", order: 0 },
                        { title: "In Progress", order: 1 },
                        { title: "Done", order: 2 },
                    ],
                },
            },
        });
        return NextResponse.json(board, { status: 201 });
    } catch {
        return apiError("Failed to create board", 500);
    }
}
