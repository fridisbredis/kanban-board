"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors, inputClass, inputStyle, overlay } from "@/lib/styles";

const BoardCreateSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string(),
});

type FormData = z.infer<typeof BoardCreateSchema>;

export default function CreateBoardForm() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError, reset } = useForm<FormData>({
        resolver: zodResolver(BoardCreateSchema),
    });

    const onSubmit = async (data: FormData) => {
        const res = await fetch("/api/boards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const { error } = await res.json();
            setError("root", { message: error || "Something went wrong" });
            return;
        }

        reset();
        router.refresh();
        setIsOpen(false);
    };

    const handleClose = () => { reset(); setIsOpen(false); };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group w-full rounded-2xl transition-all duration-200 hover:-translate-y-0.5 text-left"
                style={{
                    border: `1.5px dashed ${colors.border}`,
                    background: 'transparent',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors"
                    style={{ border: `1.5px dashed ${colors.ghost}`, color: colors.ghost }}
                >
                    +
                </div>
                <span className="text-sm font-medium transition-colors" style={{ color: colors.ghost }}>
                    New Board
                </span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0" style={overlay} onClick={handleClose} />
                    <div
                        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
                        style={{ border: `1px solid ${colors.border}` }}
                    >
                        <p className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: colors.ghost }}>
                            Create
                        </p>
                        <h2 className="font-display text-2xl font-semibold mb-7" style={{ color: colors.text }}>
                            New Board
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                                    Board Name
                                </label>
                                <input
                                    type="text"
                                    {...register("title")}
                                    placeholder="e.g. Product Roadmap"
                                    autoFocus
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
                                <input
                                    type="text"
                                    {...register("description")}
                                    placeholder="What is this board for?"
                                    className={inputClass}
                                    style={inputStyle}
                                    onFocus={e => (e.target.style.borderColor = colors.accent)}
                                    onBlur={e => (e.target.style.borderColor = colors.border)}
                                />
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
                                    {isSubmitting ? "Creating..." : "Create Board"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
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
            )}
        </>
    );
}
