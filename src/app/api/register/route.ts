import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";

const RegisterSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid data", 400);

    try {
        const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (existing) return apiError("Email already in use", 400);

        const passwordHash = await bcrypt.hash(parsed.data.password, 12);
        await prisma.user.create({
            data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
        });
        return NextResponse.json({ ok: true });
    } catch {
        return apiError("Registration failed", 500);
    }
}
