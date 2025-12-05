import { CreatePlaylistForm } from "@/components/playlist/CreatePlaylistForm";
import { Music, Users, Link2, Disc3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-12 md:py-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Disc3 className="h-12 w-12 md:h-14 md:w-14 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary/20 blur-xl" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Playlist
              <span className="text-primary">Matcher</span>
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
            Create shared playlists with friends, no matter which streaming platform you use.
            Search songs, add them together, and build the perfect mix.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>Collaborate</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm">
              <Music className="h-4 w-4 text-accent" />
              <span>Search Songs</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm">
              <Link2 className="h-4 w-4 text-chart-3" />
              <span>Share Easily</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex justify-center">
          <CreatePlaylistForm />
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-sm text-muted-foreground">
          <p>
            Built for music lovers who want to share their taste with others.
          </p>
        </footer>
      </div>
    </div>
  );
}
