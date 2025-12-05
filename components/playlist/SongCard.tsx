"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Music, Trash2, FileText, Loader2, X } from "lucide-react";

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

interface SongCardProps {
  song: Song;
  index: number;
  onRemove: () => void;
}

export function SongCard({ song, index, onRemove }: SongCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(song.lyrics);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove();
    setIsRemoving(false);
  };

  const fetchLyrics = async () => {
    if (lyrics) {
      setShowLyrics(true);
      return;
    }

    setIsLoadingLyrics(true);
    setLyricsError(false);

    try {
      const response = await fetch(
        `/api/lyrics?artist=${encodeURIComponent(song.artist)}&title=${encodeURIComponent(song.title)}`
      );
      
      const data = await response.json();
      
      if (response.ok && data.lyrics) {
        setLyrics(data.lyrics);
        setShowLyrics(true);
      } else {
        setLyricsError(true);
        toast.error("Lyrics not found for this song");
      }
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setLyricsError(true);
      toast.error("Failed to fetch lyrics");
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  return (
    <div className="song-card group flex items-center gap-4 p-4 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm">
      {/* Index */}
      <div className="w-6 text-center text-sm text-muted-foreground font-mono">
        {index}
      </div>

      {/* Album Art */}
      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
        {song.coverImageUrl ? (
          <Image
            src={song.coverImageUrl}
            alt={song.album || song.title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{song.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist}
          {song.album && <span className="hidden sm:inline"> • {song.album}</span>}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Lyrics Button */}
        <Dialog open={showLyrics} onOpenChange={setShowLyrics}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchLyrics}
              disabled={isLoadingLyrics}
              className="h-9 w-9 p-0"
            >
              {isLoadingLyrics ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {song.coverImageUrl && (
                  <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0">
                    <Image
                      src={song.coverImageUrl}
                      alt={song.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate">{song.title}</p>
                  <p className="text-sm font-normal text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto mt-4">
              {lyrics ? (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {lyrics}
                </pre>
              ) : lyricsError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Lyrics not available for this song</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          disabled={isRemoving}
          className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

