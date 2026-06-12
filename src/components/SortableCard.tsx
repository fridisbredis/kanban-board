"use client";

import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import type { Card } from "@prisma/client";
import { colors } from "@/lib/styles";

export default function SortableCard({ card, isActive, onClick }: {
    card: Card;
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
            <p className="text-sm font-medium leading-snug" style={{ color: colors.text }}>
                {card.title}
            </p>
            {card.dueDate && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.muted }}>
                    <Calendar size={12} />
                    Due {new Date(card.dueDate).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
