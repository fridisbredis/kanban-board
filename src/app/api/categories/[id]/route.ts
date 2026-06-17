import { requireAuth, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const CategoryUpdateSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    color: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = CategoryUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid data", 400);

    try {
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) return apiError("Category not found", 404);
        const category = await prisma.category.update({ where: { id }, data: parsed.data });
        return NextResponse.json(category);
    } catch {
        return apiError("Failed to update category", 500);
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await requireAuth();
    if (!userId) return apiError("Unauthorized", 401);

    try {
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) return apiError("Category not found", 404);

        await prisma.category.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch {
        return apiError("Failed to delete category", 500);
    }
}
