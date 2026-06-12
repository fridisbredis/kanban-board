"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@prisma/client";
import { colors } from "@/lib/styles";

const CardCreateSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
});

type FormData = z.infer<typeof CardCreateSchema>;

export default function CreateCardForm({ columnId, onCardCreate }: {
    columnId: string;
    onCardCreate: (card: Card) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError, reset } = useForm<FormData>({
        resolver: zodResolver(CardCreateSchema),
    });

    const onSubmit = async (data: FormData) => {
        const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, columnId }),
        });

        if (!res.ok) {
            const { error } = await res.json();
            setError("root", { message: error || "Something went wrong" });
            return;
        }

        const newCard = await res.json();
        onCardCreate(newCard);
        reset();
        setIsOpen(false);
    };

    const handleClose = () => { reset(); setIsOpen(false); };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors text-left mt-1"
                style={{ color: colors.ghost }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = colors.cream;
                    (e.currentTarget as HTMLElement).style.color = colors.muted;
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = colors.ghost;
                }}
            >
                <span className="text-base leading-none">+</span>
                <span>Add card</span>
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 mt-1">
            <input
                type="text"
                {...register("title")}
                placeholder="Card title..."
                autoFocus
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                style={{ background: 'white', border: `1.5px solid ${colors.accent}`, color: colors.text }}
            />
            {errors.title && (
                <p className="text-xs" style={{ color: colors.errorText }}>{errors.title.message}</p>
            )}
            {errors.root && (
                <p className="text-xs" style={{ color: colors.errorText }}>{errors.root.message}</p>
            )}
            <div className="flex gap-1.5">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: colors.accent }}
                >
                    {isSubmitting ? "Adding..." : "Add"}
                </button>
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 rounded-lg py-1.5 text-xs transition-all"
                    style={{ border: `1px solid ${colors.border}`, color: colors.muted }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
