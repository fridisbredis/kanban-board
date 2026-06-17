"use client";

import React from "react";
import ConfirmDialog from "./ConfirmDialog";
import { colors } from "@/lib/styles";

export default function DeleteColumnButton({ columnId, onDelete }: {
    columnId: string;
    onDelete: () => void;
}) {
    const [isOpen, setIsOpen] = React.useState(false);

    async function handleDelete() {
        try {
            const res = await fetch(`/api/columns/${columnId}`, { method: "DELETE" });
            if (res.ok) onDelete();
        } catch {
            // silently ignore — the UI stays unchanged if the request fails
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all"
                style={{ color: colors.ghost, background: 'white', border: `1px solid ${colors.border}` }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = colors.dangerText;
                    (e.currentTarget as HTMLElement).style.borderColor = colors.dangerBorder;
                    (e.currentTarget as HTMLElement).style.background = colors.dangerBg;
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = colors.ghost;
                    (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                    (e.currentTarget as HTMLElement).style.background = 'white';
                }}
                title="Delete column"
            >
                ×
            </button>

            {isOpen && (
                <ConfirmDialog
                    onConfirm={handleDelete}
                    onCancel={() => setIsOpen(false)}
                    title="Delete Column"
                    message="Are you sure you want to delete this column? All cards belonging to it are removed. This action cannot be undone."
                />
            )}
        </>
    );
}
