"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Category } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { colors, inputClass, inputStyle, overlay } from "@/lib/styles";

const PRIORITIES = ['High', 'Medium', 'Low'] as const;

const CardModalSchema = z.object({
    title: z.string().max(100),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    categoryId: z.string().nullable().optional(),
    priority: z.enum(PRIORITIES).nullable().optional(),
});

type FormData = z.infer<typeof CardModalSchema>;

export default function CardModal({ card, categories, onClose, onUpdate, onDelete }: {
    card: Card;
    categories: Category[];
    onClose: () => void;
    onUpdate: (updatedCard: Card) => void;
    onDelete: (cardId: string) => void;
}) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
        resolver: zodResolver(CardModalSchema),
        defaultValues: {
            title: card.title,
            description: card.description ?? '',
            dueDate: card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 16) : '',
            categoryId: card.categoryId ?? '',
            priority: (card.priority as typeof PRIORITIES[number] | null) ?? null,
        },
    });

    const onSubmit = async (data: FormData) => {
        const payload = {
            title: data.title,
            ...(data.description ? { description: data.description } : {}),
            ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : {}),
            categoryId: data.categoryId || null,
            priority: data.priority || null,
        };

        const res = await fetch(`/api/cards/${card.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const resData = await res.json();

        if (!res.ok) {
            setError("root", { message: resData.error || "Failed to update card" });
            return;
        }

        onUpdate(resData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" style={overlay} onClick={onClose} />
            <div
                className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
                style={{ border: `1px solid ${colors.border}` }}
            >
                <div className="flex items-start justify-between mb-7">
                    <div>
                        <p className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: colors.ghost }}>
                            Card
                        </p>
                        <h2 className="font-display text-2xl font-semibold" style={{ color: colors.text }}>
                            Edit Card
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => onDelete(card.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs transition-all mt-1"
                        style={{ color: colors.dangerText, border: `1px solid ${colors.dangerBorder}`, background: colors.dangerBg }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = colors.dangerBgHover;
                            (e.currentTarget as HTMLElement).style.borderColor = colors.dangerBorderHover;
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = colors.dangerBg;
                            (e.currentTarget as HTMLElement).style.borderColor = colors.dangerBorder;
                        }}
                    >
                        Delete
                    </button>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                            Title
                        </label>
                        <input
                            type="text"
                            {...register("title")}
                            className={inputClass}
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = colors.accent)}
                            onBlur={e => (e.target.style.borderColor = colors.border)}
                        />
                        {errors.title && (
                            <p className="text-xs" style={{ color: colors.errorText }}>{errors.title.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                            Description <span className="normal-case font-normal" style={{ color: colors.ghost }}>— optional</span>
                        </label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            className={`${inputClass} resize-none`}
                            style={{ ...inputStyle, lineHeight: '1.6' }}
                            onFocus={e => (e.target.style.borderColor = colors.accent)}
                            onBlur={e => (e.target.style.borderColor = colors.border)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                            Due Date <span className="normal-case font-normal" style={{ color: colors.ghost }}>— optional</span>
                        </label>
                        <input
                            type="datetime-local"
                            {...register("dueDate")}
                            className={inputClass}
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = colors.accent)}
                            onBlur={e => (e.target.style.borderColor = colors.border)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                            Priority <span className="normal-case font-normal" style={{ color: colors.ghost }}>— optional</span>
                        </label>
                        <div className="relative">
                            <select
                                {...register("priority")}
                                className={`${inputClass} appearance-none pr-10`}
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = colors.accent)}
                                onBlur={e => (e.target.style.borderColor = colors.border)}
                            >
                                <option value="">No priority</option>
                                {PRIORITIES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.muted }} />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                            Category <span className="normal-case font-normal" style={{ color: colors.ghost }}>— optional</span>
                        </label>
                        <div className="relative">
                            <select
                                {...register("categoryId")}
                                className={`${inputClass} appearance-none pr-10`}
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = colors.accent)}
                                onBlur={e => (e.target.style.borderColor = colors.border)}
                            >
                                <option value="">No category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.muted }} />
                            </svg>
                        </div>
                    </div>

                    {errors.root && (
                        <p className="text-xs" style={{ color: colors.errorText }}>{errors.root.message}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: colors.accent }}
                            onMouseEnter={e => ((e.target as HTMLElement).style.background = colors.accentHover)}
                            onMouseLeave={e => ((e.target as HTMLElement).style.background = colors.accent)}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 rounded-xl py-2.5 text-sm transition-all"
                            style={{ border: `1.5px solid ${colors.border}`, color: colors.muted }}
                            onMouseEnter={e => ((e.target as HTMLElement).style.borderColor = colors.borderStrong)}
                            onMouseLeave={e => ((e.target as HTMLElement).style.borderColor = colors.border)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
