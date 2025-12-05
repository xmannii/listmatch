"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PlaylistView } from "@/components/playlist/PlaylistView";
import { PinDialog } from "@/components/playlist/PinDialog";
import { Disc3 } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  coverImageUrl: string | null;
  lyrics: string | null;
  itunesId: string | null;
  createdAt: string;
  order: number;
}

interface Playlist {
  id: string;
  name: string;
  slug: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  songs: Song[];
}

export default function PlaylistPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPin, setRequiresPin] = useState(false);
  const [pin, setPin] = useState<string | null>(searchParams.get("pin"));

  const fetchPlaylist = useCallback(async (pinToUse?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`/api/playlists/${slug}`, window.location.origin);
      if (pinToUse) {
        url.searchParams.set("pin", pinToUse);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.status === 401 && data.requiresPin) {
        setRequiresPin(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to load playlist");
      }

      setPlaylist(data);
      setRequiresPin(false);
      if (pinToUse) {
        setPin(pinToUse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPlaylist(pin || undefined);
  }, [fetchPlaylist, pin]);

  const handlePinSubmit = (enteredPin: string) => {
    fetchPlaylist(enteredPin);
  };

  const handleSongAdded = () => {
    fetchPlaylist(pin || undefined);
  };

  const handleSongRemoved = () => {
    fetchPlaylist(pin || undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Disc3 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (requiresPin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <PinDialog onSubmit={handlePinSubmit} error={error} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Playlist Not Found</h1>
          <p className="text-muted-foreground">This playlist doesn&apos;t exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <PlaylistView
        playlist={playlist}
        pin={pin}
        onSongAdded={handleSongAdded}
        onSongRemoved={handleSongRemoved}
      />
    </div>
  );
}

