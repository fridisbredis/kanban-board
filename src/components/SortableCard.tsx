"use client";

import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import type { Card, Category } from "@prisma/client";
import { colors } from "@/lib/styles";

export default function SortableCard({ card, categories, categoriesLoading, isActive, onClick }: {
    card: Card;
    categories: Category[];
    categoriesLoading?: boolean;
    isActive: boolean;
    onClick: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: card.id,
        animateLayoutChanges: (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: false }),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const category = card.categoryId ? categories.find(c => c.id === card.categoryId) : null;

    const priorityFlag: Record<string, string> = {
        High:   colors.priorityHigh,
        Medium: colors.priorityMedium,
        Low:    colors.priorityLow,
    };
    const priority = card.priority ? priorityFlag[card.priority] : null;

    return (
        <div
            ref={setNodeRef}
            className={`rounded-xl px-3 py-2.5 cursor-grab transition-all duration-150 hover:-translate-y-px hover:shadow-sm bg-white ${isActive ? 'ring-2' : ''}`}
            {...attributes}
            {...listeners}
            {...(isActive ? { style: { ...style, outline: `2px solid ${colors.accent}` } } : {})}
            style={{ ...style, ...(isActive ? { outline: `2px solid ${colors.accent}` } : {}) }}
            onClick={onClick}
        >
            {(category || (categoriesLoading && card.categoryId)) && (
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {category ? (
                        <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                                background: category.color ? `${category.color}30` : colors.cream,
                                color: category.color ?? colors.muted,
                            }}
                        >
                            {category.name}
                        </span>
                    ) : (
                        <span className="inline-flex rounded-full h-5 w-16 animate-pulse" style={{ background: colors.cream }} />
                    )}
                </div>
            )}
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium leading-snug" style={{ color: colors.text }}>
                    {card.title}
                </p>
                {priority && (
                    <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: priority }}
                        title={card.priority ?? undefined}
                    />
                )}
            </div>
            {card.dueDate && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.muted }}>
                    <Calendar size={12} />
                    Due {new Date(card.dueDate).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
