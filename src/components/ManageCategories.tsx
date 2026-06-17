"use client"

import { useEffect, useRef, useState } from "react";
import { colors, overlay, inputStyle, inputClass, cardSurfaceStyle } from "@/lib/styles";
import { COLUMN_ACCENTS } from "@/lib/styles";

type Category = { id: string; name: string; color: string | null; boardId: string };

const COLOR_PALETTE = [
    ...COLUMN_ACCENTS,
    '#F4A9A8', '#89C4E1', '#B5D8A8', '#F9C784', '#D4A5C9', '#A5C4D4',
] as const;

export function ManageCategoriesComponent({
    boardId,
    onClose,
    onCategoryDeleted,
    onCategoryUpdated,
    onCategoryCreated,
}: {
    boardId: string;
    onClose: () => void;
    onCategoryDeleted: (id: string) => void;
    onCategoryUpdated: (category: Category) => void;
    onCategoryCreated: (category: Category) => void;
}) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [colorPickerId, setColorPickerId] = useState<string | null>(null);
    const [colorPickerPos, setColorPickerPos] = useState<{ top: number; left: number } | null>(null);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState<string | null>(null);
    const [newColorPickerOpen, setNewColorPickerOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/api/categories?boardId=${boardId}`)
            .then(r => r.json())
            .then(data => { setCategories(data); setLoading(false); });
    }, [boardId]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    async function handleDelete(id: string) {
        const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        if (!res.ok) return;
        setCategories(cs => cs.filter(c => c.id !== id));
        onCategoryDeleted(id);
    }

    async function commitRename(id: string) {
        const name = editingName.trim();
        if (!name || name.length < 2) { setEditingId(null); return; }
        const res = await fetch(`/api/categories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) { setEditingId(null); return; }
        setCategories(cs => cs.map(c => c.id === id ? { ...c, name } : c));
        const updated = categories.find(c => c.id === id);
        if (updated) onCategoryUpdated({ ...updated, name });
        setEditingId(null);
    }

    function handleRecolor(id: string, color: string | null) {
        setCategories(cs => cs.map(c => c.id === id ? { ...c, color } : c));
        setColorPickerId(null);
        setColorPickerPos(null);
        const updated = categories.find(c => c.id === id);
        if (updated) onCategoryUpdated({ ...updated, color });
        fetch(`/api/categories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ color }),
        });
    }

    async function handleCreate() {
        if (!newName.trim() || newName.trim().length < 2) return;
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim(), boardId, color: newColor }),
        });
        if (!res.ok) return;
        const created = await res.json();
        setCategories(cs => [...cs, created]);
        onCategoryCreated(created);
        setNewName('');
        setNewColor(null);
        setNewColorPickerOpen(false);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ ...overlay }}
            onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                ref={panelRef}
                className="w-full max-w-md rounded-2xl bg-white flex flex-col"
                style={{ ...cardSurfaceStyle, maxHeight: '80vh' }}
                onPointerDown={e => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor: colors.border }}
                >
                    <h2 className="font-semibold text-sm" style={{ color: colors.text }}>Manage categories</h2>
                    <button
                        onClick={onClose}
                        className="text-lg leading-none px-1 rounded"
                        style={{ color: colors.ghost }}
                    >
                        ×
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 px-5 py-3 flex flex-col gap-2">
                    {loading ? (
                        <p className="text-sm py-4 text-center" style={{ color: colors.ghost }}>Loading…</p>
                    ) : categories.length === 0 ? (
                        <p className="text-sm py-4 text-center" style={{ color: colors.ghost }}>No categories yet.</p>
                    ) : categories.map(cat => (
                        <div key={cat.id} className="relative">
                            <div
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 group"
                                style={{ background: colors.cream }}
                            >
                                {/* Color swatch button */}
                                <button
                                    onClick={(e) => {
                                        if (colorPickerId === cat.id) {
                                            setColorPickerId(null);
                                            setColorPickerPos(null);
                                        } else {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const pickerWidth = 192;
                                            const pickerHeight = 120;
                                            const left = Math.min(rect.left, window.innerWidth - pickerWidth - 8);
                                            const fitsBelow = rect.bottom + 4 + pickerHeight < window.innerHeight;
                                            const top = fitsBelow ? rect.bottom + 4 : rect.top - pickerHeight - 4;
                                            setColorPickerPos({ top, left });
                                            setColorPickerId(cat.id);
                                        }
                                    }}
                                    className="w-5 h-5 rounded-full flex-shrink-0 border"
                                    style={{
                                        background: cat.color ?? colors.ghost,
                                        borderColor: colors.border,
                                    }}
                                    title="Change color"
                                />

                                {/* Name / inline edit */}
                                {editingId === cat.id ? (
                                    <input
                                        className={inputClass + ' flex-1 text-xs py-1 px-2'}
                                        style={inputStyle}
                                        autoFocus
                                        value={editingName}
                                        onChange={e => setEditingName(e.target.value)}
                                        onBlur={() => commitRename(cat.id)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') commitRename(cat.id);
                                            else if (e.key === 'Escape') setEditingId(null);
                                        }}
                                    />
                                ) : (
                                    <span
                                        className="flex-1 text-sm cursor-text truncate"
                                        style={{ color: colors.text }}
                                        onPointerUp={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                                    >
                                        {cat.name}
                                    </span>
                                )}

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded"
                                    style={{ color: colors.dangerText, background: colors.dangerBg }}
                                >
                                    Delete
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Create new */}
                <div
                    className="px-5 py-4 border-t flex flex-col gap-2"
                    style={{ borderColor: colors.border }}
                >
                    <div className="flex items-center gap-2">
                        <button
                            className="w-6 h-6 rounded-full flex-shrink-0 border"
                            style={{
                                background: newColor ?? colors.cream,
                                borderColor: colors.border,
                            }}
                            onClick={() => setNewColorPickerOpen(o => !o)}
                            title="Pick color"
                        />
                        <input
                            className={inputClass + ' flex-1 py-2 text-sm'}
                            style={inputStyle}
                            placeholder="New category name…"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                        />
                        <button
                            onClick={handleCreate}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-white flex-shrink-0"
                            style={{ background: colors.accent }}
                        >
                            Add
                        </button>
                    </div>
                    {newColorPickerOpen && (
                        <div className="flex flex-wrap gap-1.5 px-1">
                            <button
                                className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs"
                                style={{ borderColor: colors.border, color: colors.ghost }}
                                title="No color"
                                onClick={() => { setNewColor(null); setNewColorPickerOpen(false); }}
                            >
                                ×
                            </button>
                            {COLOR_PALETTE.map(c => (
                                <button
                                    key={c}
                                    className="w-6 h-6 rounded-full border-2"
                                    style={{
                                        background: c,
                                        borderColor: newColor === c ? colors.text : 'transparent',
                                    }}
                                    onClick={() => { setNewColor(c); setNewColorPickerOpen(false); }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed-position color picker — rendered outside the scroll container to avoid clipping */}
            {colorPickerId && colorPickerPos && (
                <div
                    className="fixed z-[60] rounded-xl p-2 flex flex-wrap gap-1.5"
                    style={{ top: colorPickerPos.top, left: colorPickerPos.left, width: 192, background: 'white', ...cardSurfaceStyle }}
                >
                    <button
                        type="button"
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs"
                        style={{ borderColor: colors.border, color: colors.ghost }}
                        title="No color"
                        onClick={() => handleRecolor(colorPickerId, null)}
                    >
                        ×
                    </button>
                    {COLOR_PALETTE.map(c => {
                        const cat = categories.find(cat => cat.id === colorPickerId);
                        return (
                            <button
                                type="button"
                                key={c}
                                className="w-6 h-6 rounded-full border-2"
                                style={{
                                    background: c,
                                    borderColor: cat?.color === c ? colors.text : 'transparent',
                                }}
                                onClick={() => handleRecolor(colorPickerId, c)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
