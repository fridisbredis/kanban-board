import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiError, requireAuth } from '@/lib/api-helpers';

const CardUpdateSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    order: z.number().optional(),
    columnId: z.string().min(1).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const card = await prisma.card.findUnique({ where: { id } });
        if (!card) return apiError("Card not found", 404);
        return NextResponse.json(card);
    } catch {
        return apiError("Failed to fetch card", 500);
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = CardUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid data", 400);

    try {
        const card = await prisma.card.findUnique({ where: { id } });
        if (!card) return apiError("Card not found", 404);

        const updatedCard = await prisma.card.update({ where: { id }, data: parsed.data });
        return NextResponse.json(updatedCard);
    } catch {
        return apiError("Failed to update card", 500);
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    try {
        const card = await prisma.card.findUnique({ where: { id } });
        if (!card) return apiError("Card not found", 404);

        await prisma.card.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch {
        return apiError("Failed to delete card", 500);
    }
}
