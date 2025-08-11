"use client";

export default function Tag({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={[
                "rounded-full px-3 py-1 text-xs",
                active
                    ? "bg-white text-black"
                    : "bg-white/10 hover:bg-white/20 text-zinc-200",
                "border border-white/10 transition"
            ].join(" ")}
        >
            {children}
        </button>
    );
}
