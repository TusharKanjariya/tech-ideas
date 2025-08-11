import "./globals.css";

export const metadata = { title: "Tech Ideas Dashboard" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-zinc-200 antialiased">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
            <div className="font-semibold tracking-wide">🧠 Tech Ideas</div>
            <div className="ml-auto text-sm text-zinc-400 hidden sm:block">
              Daily ideas · Momentum · Tag optimizer · Headlines
            </div>
          </div>
        </header>

        {/* Center all pages */}
        <main className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
