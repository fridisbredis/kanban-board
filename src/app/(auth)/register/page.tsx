"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { colors, inputClass, inputStyle } from "@/lib/styles";

const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
        resolver: zodResolver(RegisterSchema),
    });

    const onSubmit = async (data: FormData) => {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const { error } = await res.json();
            setError("root", { message: error || "Something went wrong" });
            return;
        }

        router.push("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: colors.cream }}>
            <div
                className="w-full max-w-md bg-white rounded-2xl p-8"
                style={{ border: `1px solid ${colors.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
                <p className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: colors.ghost }}>
                    Get started
                </p>
                <h1 className="font-display text-3xl font-semibold mb-7" style={{ color: colors.text }}>
                    Create an account
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                            Name
                        </label>
                        <input
                            {...register("name")}
                            type="text"
                            className={inputClass}
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = colors.accent)}
                            onBlur={e => (e.target.style.borderColor = colors.border)}
                        />
                        {errors.name && (
                            <p className="text-xs" style={{ color: colors.errorText }}>{errors.name.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                            Email
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            className={inputClass}
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = colors.accent)}
                            onBlur={e => (e.target.style.borderColor = colors.border)}
                        />
                        {errors.email && (
                            <p className="text-xs" style={{ color: colors.errorText }}>{errors.email.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                            Password
                        </label>
                        <input
                            {...register("password")}
                            type="password"
                            className={inputClass}
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = colors.accent)}
                            onBlur={e => (e.target.style.borderColor = colors.border)}
                        />
                        {errors.password && (
                            <p className="text-xs" style={{ color: colors.errorText }}>{errors.password.message}</p>
                        )}
                    </div>

                    {errors.root && (
                        <p className="text-xs" style={{ color: colors.errorText }}>{errors.root.message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 mt-1"
                        style={{ background: colors.accent }}
                        onMouseEnter={e => ((e.target as HTMLElement).style.background = colors.accentHover)}
                        onMouseLeave={e => ((e.target as HTMLElement).style.background = colors.accent)}
                    >
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="text-sm text-center mt-5" style={{ color: colors.muted }}>
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium hover:underline" style={{ color: colors.accent }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
