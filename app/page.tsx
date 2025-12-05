import { CreatePlaylistForm } from "@/components/playlist/CreatePlaylistForm";
import { Music, Users, Link2, Disc3, Github } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlist Matcher - Create Shared Playlists with Friends",
  description: "Create collaborative playlists with friends. Search songs, add them together, and build the perfect mix. Share your playlists easily.",
  keywords: ["playlist", "music", "collaborative", "share", "songs", "music playlist"],
  openGraph: {
    title: "Playlist Matcher - Create Shared Playlists",
    description: "Create collaborative playlists with friends. Search songs, add them together, and build the perfect mix.",
    type: "website",
    siteName: "Playlist Matcher",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playlist Matcher - Create Shared Playlists",
    description: "Create collaborative playlists with friends. Search songs, add them together, and build the perfect mix.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {/* Left Side - Hero Section */}
          <div className="flex-1 w-full md:text-left text-center">
            <div className="flex flex-col sm:flex-row items-center sm:justify-center md:justify-start gap-3 sm:gap-3 mb-4 sm:mb-6">
              <div className="relative shrink-0">
                <Disc3 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-primary/20 blur-lg" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Playlist
                <span className="text-primary">Matcher</span>
              </h1>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg mx-auto md:mx-0 mb-6 sm:mb-8 md:mb-10 px-2 sm:px-0">
              Create shared playlists with friends. Search songs, add them together, and build the perfect mix.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8 px-2 sm:px-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/60 border border-border/30 text-xs sm:text-sm backdrop-blur-sm">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span>Collaborate</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/60 border border-border/30 text-xs sm:text-sm backdrop-blur-sm">
                <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
                <span>Search</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/60 border border-border/30 text-xs sm:text-sm backdrop-blur-sm">
                <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-chart-3 shrink-0" />
                <span>Share</span>
              </div>
            </div>

            {/* Footer - Left Side */}
            <div className="mt-6 sm:mt-8 md:mt-12">
              <Link
                href="https://github.com/xmannii/listmatch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                <span>Built by Mani</span>
              </Link>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <CreatePlaylistForm />
          </div>
        </div>
      </div>
    </div>
  );
}
