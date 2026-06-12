"use client";

import type { Column, Card } from "@prisma/client";
import CreateCardForm from "./CreateCardForm";
import { useState } from "react";
import SortableCard from "./SortableCard";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DroppableColumn from "./DroppableColumn";
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import CardModal from "./CardModal";
import DeleteColumnButton from "./DeleteColumnButton";
import { colors, cardSurfaceStyle, COLUMN_ACCENTS } from "@/lib/styles";

type ColumnWithCards = Column & { cards: Card[] };

function patchCardOrder(cards: Card[]) {
    cards.forEach((card, index) => {
        fetch(`/api/cards/${card.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: index }),
        });
    });
}

export default function KanbanBoard({ columns: initialColumns, boardId }: { columns: ColumnWithCards[]; boardId: string }) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const [columns, setColumns] = useState(initialColumns);
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    function handleDragStart(event: any) {
        const card = columns.flatMap(col => col.cards).find(c => c.id === event.active.id);
        setActiveCard(card ?? null);
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            setActiveCard(null);
            return;
        }

        const sourceColumn = columns.find(col => col.cards.some(c => c.id === active.id));
        const targetColumn = columns.find(col =>
            col.id === over.id || col.cards.some(c => c.id === over.id)
        );

        if (!sourceColumn || !targetColumn) return;

        if (sourceColumn.id === targetColumn.id) {
            const oldIndex = sourceColumn.cards.findIndex(c => c.id === active.id);
            const newIndex = sourceColumn.cards.findIndex(c => c.id === over.id);
            const reorderedCards = arrayMove(sourceColumn.cards, oldIndex, newIndex);
            setColumns(cols =>
                cols.map(col => col.id === sourceColumn.id ? { ...col, cards: reorderedCards } : col)
            );
            patchCardOrder(reorderedCards);
        } else {
            const dragged = sourceColumn.cards.find(c => c.id === active.id);
            if (!dragged) return;

            const newSourceCards = sourceColumn.cards.filter(c => c.id !== active.id);
            const overIndex = targetColumn.cards.findIndex(c => c.id === over.id);
            const insertIndex = overIndex === -1 ? targetColumn.cards.length : overIndex;
            const newTargetCards = [...targetColumn.cards];
            newTargetCards.splice(insertIndex, 0, dragged);

            setColumns(cols =>
                cols.map(col => {
                    if (col.id === sourceColumn.id) return { ...col, cards: newSourceCards };
                    if (col.id === targetColumn.id) return { ...col, cards: newTargetCards };
                    return col;
                })
            );
            patchCardOrder(newSourceCards);
            patchCardOrder(newTargetCards);
        }

        setActiveCard(null);
    }

    async function saveColumnTitle(columnId: string, newTitle: string) {
        const res = await fetch(`/api/columns/${columnId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle }),
        });
        if (!res.ok) return;
        const updatedColumn = await res.json();
        setColumns(cols =>
            cols.map(col => col.id === columnId ? { ...col, title: updatedColumn.title } : col)
        );
        setEditingColumnId(null);
    }

    async function handleAddColumn(title: string) {
        if (!title.trim()) return;
        const res = await fetch("/api/columns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, boardId }),
        });
        if (!res.ok) return;
        const newColumn = await res.json();
        setColumns(cols => [...cols, { ...newColumn, cards: [] }]);
        setIsOpen(false);
    }

    function handleDeleteColumn(columnId: string) {
        setColumns(cols => cols.filter(col => col.id !== columnId));
    }

    async function handleCardDelete(cardId: string) {
        const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
        if (!res.ok) return;
        setColumns(cols =>
            cols.map(col => ({ ...col, cards: col.cards.filter(c => c.id !== cardId) }))
        );
        setSelectedCard(null);
    }

    function handleCardUpdate(updatedCard: Card) {
        setColumns(cols =>
            cols.map(col => ({
                ...col,
                cards: col.cards.map(card => card.id === updatedCard.id ? updatedCard : card),
            }))
        );
        setSelectedCard(null);
    }

    function handleNewCard(newCard: Card) {
        setColumns(cols =>
            cols.map(col => col.id === newCard.columnId ? { ...col, cards: [...col.cards, newCard] } : col)
        );
    }

    return (
        <DndContext id="kanban-id" sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onUpdate={handleCardUpdate}
                    onDelete={handleCardDelete}
                />
            )}
            <div className="flex gap-4 items-start" style={{ width: 'max-content', minHeight: '100%' }}>
                {columns.map((column, i) => {
                    const accent = COLUMN_ACCENTS[i % COLUMN_ACCENTS.length];
                    return (
                        <div
                            key={column.id}
                            className="group/col flex flex-col rounded-2xl bg-white w-72 flex-shrink-0"
                            style={cardSurfaceStyle}
                        >
                            <div
                                className="px-4 pt-4 pb-3 flex items-center justify-between border-b"
                                style={{ borderColor: colors.border }}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: accent }} />
                                    {editingColumnId === column.id ? (
                                        <input
                                            type="text"
                                            defaultValue={column.title}
                                            autoFocus
                                            className="rounded-lg px-2 py-0.5 text-sm font-semibold outline-none w-36"
                                            style={{ background: colors.cream, border: `1.5px solid ${colors.accent}`, color: colors.text }}
                                            onBlur={(e) => saveColumnTitle(column.id, e.currentTarget.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveColumnTitle(column.id, e.currentTarget.value);
                                                else if (e.key === 'Escape') setEditingColumnId(null);
                                            }}
                                        />
                                    ) : (
                                        <h3
                                            className="font-semibold text-sm cursor-text"
                                            style={{ color: colors.text }}
                                            onPointerUp={() => setEditingColumnId(column.id)}
                                        >
                                            {column.title}
                                        </h3>
                                    )}
                                    <span
                                        className="text-xs font-mono px-1.5 py-0.5 rounded-md flex-shrink-0"
                                        style={{ background: colors.cream, color: colors.ghost }}
                                    >
                                        {column.cards.length}
                                    </span>
                                </div>
                                <div className="opacity-0 group-hover/col:opacity-100 transition-opacity duration-150 flex-shrink-0">
                                    <DeleteColumnButton columnId={column.id} onDelete={() => handleDeleteColumn(column.id)} />
                                </div>
                            </div>

                            <DroppableColumn id={column.id}>
                                <SortableContext
                                    items={column.cards.map(card => card.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {column.cards.map(card => (
                                        <SortableCard
                                            key={card.id}
                                            card={card}
                                            isActive={activeCard?.id === card.id}
                                            onClick={() => setSelectedCard(card)}
                                        />
                                    ))}
                                </SortableContext>
                                <CreateCardForm columnId={column.id} onCardCreate={handleNewCard} />
                            </DroppableColumn>
                        </div>
                    );
                })}

                {isOpen ? (
                    <div
                        className="flex flex-col rounded-2xl bg-white w-72 flex-shrink-0 p-4 gap-3"
                        style={cardSurfaceStyle}
                    >
                        <input
                            type="text"
                            placeholder="Column title"
                            autoFocus
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                            style={{ background: colors.cream, border: `1.5px solid ${colors.accent}`, color: colors.text }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAddColumn((e.target as HTMLInputElement).value);
                                } else if (e.key === "Escape") {
                                    setIsOpen(false);
                                }
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    const input = (e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement);
                                    handleAddColumn(input?.value ?? '');
                                }}
                                className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-white"
                                style={{ background: colors.accent }}
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-3 rounded-lg py-1.5 text-xs"
                                style={{ border: `1px solid ${colors.border}`, color: colors.muted }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 rounded-2xl w-72 flex-shrink-0 px-4 py-3 text-sm transition-all"
                        style={{ border: `1.5px dashed ${colors.border}`, color: colors.ghost, background: 'transparent' }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = colors.borderStrong;
                            (e.currentTarget as HTMLElement).style.color = colors.muted;
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                            (e.currentTarget as HTMLElement).style.color = colors.ghost;
                        }}
                    >
                        <span className="text-base leading-none">+</span>
                        <span>Add column</span>
                    </button>
                )}
            </div>

            <DragOverlay>
                {activeCard ? (
                    <div
                        className="rounded-xl px-3 py-2.5 shadow-lg bg-white"
                        style={{ border: `1px solid ${colors.border}` }}
                    >
                        <p className="text-sm font-medium" style={{ color: colors.text }}>{activeCard.title}</p>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
