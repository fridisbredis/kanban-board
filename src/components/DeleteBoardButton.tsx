"use client";

import { useRouter } from "next/navigation";
import React from "react";
import ConfirmDialog from "./ConfirmDialog";
import { colors } from "@/lib/styles";

export default function DeleteBoardButton({ boardId }: { boardId: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);

    async function handleDelete() {
        try {
            const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
            if (res.ok) router.refresh();
        } catch (error) {
            console.error("Error deleting board:", error);
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
                title="Delete board"
            >
                ×
            </button>

            {isOpen && (
                <ConfirmDialog
                    onConfirm={handleDelete}
                    onCancel={() => setIsOpen(false)}
                    title="Delete Board"
                    message="Are you sure you want to delete this board? This action cannot be undone."
                />
            )}
        </>
    );
}
