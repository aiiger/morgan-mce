
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Inter, JetBrains_Mono, Oswald } from 'next/font/google';
import '../index.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Morgan ERP • Financial Command',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_DISABLE_AUTH: process.env.NEXT_PUBLIC_DISABLE_AUTH,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning={true} className={`${inter.variable} ${jetbrainsMono.variable} ${oswald.variable} font-sans antialiased`}>
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  // Force light theme — dark mode is not supported in this version
  document.documentElement.dataset.theme = 'light';
  // Clear any stale theme config that might cause dark flashes
  try {
    var cfg = localStorage.getItem('mce-style-config');
    if (cfg) {
      var parsed = JSON.parse(cfg);
      if (parsed.theme && parsed.theme !== 'light') {
        parsed.theme = 'light';
        localStorage.setItem('mce-style-config', JSON.stringify(parsed));
      }
    }
  } catch(e) {}
})();`
          }}
        />
      </head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV=${JSON.stringify(publicEnv)};`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
