import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAuth } from "@/lib/api-helpers";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    try {
        const board = await prisma.board.findUnique({ where: { id } });
        if (!board) return apiError("Board not found", 404);
        if (board.ownerId !== userId) return apiError("Forbidden", 403);

        await prisma.board.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch {
        return apiError("Failed to delete board", 500);
    }
}
