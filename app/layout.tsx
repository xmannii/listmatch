import type { Metadata } from "next";
import { Space_Mono, Syne } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Playlist Matcher - Create Shared Playlists",
    template: "%s | Playlist Matcher",
  },
  description: "Create collaborative playlists with friends. Search songs, add them together, and build the perfect mix. Share your playlists easily.",
  keywords: ["playlist", "music", "collaborative", "share", "songs", "music playlist", "shared playlist"],
  authors: [{ name: "Mani", url: "https://github.com/xmannii" }],
  creator: "Mani",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Playlist Matcher",
    title: "Playlist Matcher - Create Shared Playlists",
    description: "Create collaborative playlists with friends. Search songs, add them together, and build the perfect mix.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playlist Matcher - Create Shared Playlists",
    description: "Create collaborative playlists with friends. Search songs, add them together, and build the perfect mix.",
    creator: "@xmannii",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${spaceMono.variable} antialiased font-sans`}
      >
        {children}
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
