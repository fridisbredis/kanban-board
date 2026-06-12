"use client";

import { createPortal } from "react-dom";
import { colors, overlay } from "@/lib/styles";

export default function ConfirmDialog({ title, message, onConfirm, onCancel }: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={overlay}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="relative w-full max-w-sm rounded-2xl bg-white p-6"
                style={{ border: `1px solid ${colors.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            >
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: colors.text }}>
                    {title}
                </h3>
                <p className="text-sm mb-5" style={{ color: colors.muted }}>{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onCancel(); }}
                        className="px-4 py-2 rounded-lg text-sm transition-all"
                        style={{ border: `1.5px solid ${colors.border}`, color: colors.muted }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = colors.borderStrong)}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = colors.border)}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onConfirm(); }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{ background: colors.dangerBg, color: colors.dangerText, border: `1px solid ${colors.dangerBorder}` }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = colors.dangerBgHover;
                            (e.currentTarget as HTMLElement).style.borderColor = colors.dangerBorderHover;
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = colors.dangerBg;
                            (e.currentTarget as HTMLElement).style.borderColor = colors.dangerBorder;
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
