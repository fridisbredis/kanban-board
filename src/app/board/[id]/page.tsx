import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const board = await prisma.board.findUnique({
        where: { id },
        include: {
            columns: {
                orderBy: { order: "asc" },
                include: {
                    cards: {
                        orderBy: { order: "asc" },
                    },
                },
            },
        },
    });

    if (!board) return notFound();

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
            <header className="bg-white border-b px-8 py-4 flex items-center gap-4 flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--accent)]"
                    style={{ color: 'var(--muted)' }}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Boards
                </Link>
                <span style={{ color: 'var(--border)' }}>/</span>
                <h1 className="font-display text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    {board.title}
                </h1>
                {board.description && (
                    <span className="text-sm hidden sm:block" style={{ color: 'var(--muted)' }}>
                        — {board.description}
                    </span>
                )}
            </header>

            <div className="flex-1 overflow-x-auto px-8 py-8">
                {board.columns.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-sm" style={{ color: 'var(--ghost)' }}>
                            No columns yet.
                        </p>
                    </div>
                ) : (
                    <KanbanBoard columns={board.columns} boardId={board.id} />
                )}
            </div>
        </div>
    );
}
