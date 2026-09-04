import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veritas Clinical AI — Luxury Obsidian & Mint-Teal Edition',
  description: 'Where clinical precision meets autonomous intelligence. Real-time AssemblyAI diarization, Gemini 2.0 reasoning, AMA/CMS MDM coding, and pre-claim denial radar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050B0A] text-slate-100 min-h-screen antialiased selection:bg-[#00F2C2] selection:text-[#040E0C]">
        {children}
      </body>
    </html>
  );
}
