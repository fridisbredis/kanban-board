import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateBoardForm from "@/components/CreateBoardForm";
import DeleteBoardButton from "@/components/DeleteBoardButton";
import { colors, cardSurfaceStyle, BOARD_ACCENTS } from "@/lib/styles";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const myBoards = await prisma.board.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen" style={{ background: colors.cream }}>
            <header
                className="bg-white border-b px-8 py-4 flex items-center justify-between"
                style={{ borderColor: colors.border }}
            >
                <span className="font-display text-xl font-semibold" style={{ color: colors.text }}>
                    Kanban
                </span>
                {session?.user && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ color: colors.muted }}>{session.user.name}</span>
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                            style={{ background: colors.accent }}
                        >
                            {session.user.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <SignOutButton />
                    </div>
                )}
            </header>

            <main className="max-w-5xl mx-auto px-8 py-12">
                {session?.user ? (
                    <>
                        <div className="mb-10">
                            <p className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: colors.ghost }}>
                                Workspace
                            </p>
                            <h1 className="font-display text-5xl font-semibold leading-tight" style={{ color: colors.text }}>
                                My Boards
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myBoards.map((board, i) => {
                                const accent = BOARD_ACCENTS[i % BOARD_ACCENTS.length];
                                return (
                                    <div key={board.id} className="relative group">
                                        <Link
                                            href={`/board/${board.id}`}
                                            className="block bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                            style={cardSurfaceStyle}
                                        >
                                            <div className="h-1.5" style={{ background: accent.top }} />
                                            <div className="p-5">
                                                <div
                                                    className="w-9 h-9 rounded-xl mb-5 flex items-center justify-center text-sm font-semibold"
                                                    style={{ background: accent.bg, color: accent.top }}
                                                >
                                                    {board.title[0]?.toUpperCase()}
                                                </div>
                                                <h2
                                                    className="font-display text-lg font-semibold mb-1 group-hover:text-[var(--accent)] transition-colors"
                                                    style={{ color: colors.text }}
                                                >
                                                    {board.title}
                                                </h2>
                                                {board.description && (
                                                    <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: colors.muted }}>
                                                        {board.description}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            <DeleteBoardButton boardId={board.id} />
                                        </div>
                                    </div>
                                );
                            })}

                            <CreateBoardForm />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 gap-3 text-center">
                        <h2 className="font-display text-3xl font-semibold" style={{ color: colors.text }}>
                            Not logged in
                        </h2>
                        <p className="text-sm" style={{ color: colors.muted }}>Sign in to access your boards.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
