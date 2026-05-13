import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "NexPress",
  description: "Phase 05 install and runtime configuration foundation for the NexPress monorepo."
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  const environment = env.NODE_ENV;

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen">
          <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.24em] text-sky-700 uppercase">
                  NexPress
                </p>
                <p className="text-xs text-slate-500">Install and runtime configuration foundation</p>
              </div>
              <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {environment}
              </p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
