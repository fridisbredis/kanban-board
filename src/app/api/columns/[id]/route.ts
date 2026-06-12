import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiError, requireAuth } from '@/lib/api-helpers';

const ColumnUpdateSchema = z.object({
    title: z.string().min(1).max(100).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = ColumnUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid data", 400);

    try {
        const column = await prisma.column.findUnique({ where: { id } });
        if (!column) return apiError("Column not found", 404);

        const updatedColumn = await prisma.column.update({ where: { id }, data: parsed.data });
        return NextResponse.json(updatedColumn);
    } catch {
        return apiError("Failed to update column", 500);
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    try {
        const column = await prisma.column.findUnique({ where: { id } });
        if (!column) return apiError("Column not found", 404);

        await prisma.column.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch {
        return apiError("Failed to delete column", 500);
    }
}
