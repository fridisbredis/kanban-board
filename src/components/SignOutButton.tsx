"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-sm transition-all"
            style={{ color: 'var(--muted)' }}
            title="Sign out"
        >
            <LogOut size={16} />
        </button>
    );
}
