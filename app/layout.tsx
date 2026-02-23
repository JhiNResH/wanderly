import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wanderly – Save & Organize Content',
  description: 'Your AI-powered content collection. Save URLs from Telegram, auto-categorize, and explore.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              <span className="font-bold text-xl text-gray-900">Wanderly</span>
            </a>
            <nav className="flex items-center gap-4 text-sm text-gray-600">
              <a href="/" className="hover:text-gray-900 transition-colors">Collections</a>
              <a href="/items" className="hover:text-gray-900 transition-colors">All Items</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-sm text-gray-400 py-8">
          Built with ❤️ using Next.js, Claude AI & Supabase
        </footer>
      </body>
    </html>
  );
}
