"use client";

import { useDroppable } from "@dnd-kit/core";

export default function DroppableColumn({ id, children }: { id: string, children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex flex-col gap-2 p-3 flex-1 min-h-16">
            {children}
        </div>
    );
}
