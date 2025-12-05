"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SongSearch } from "./SongSearch";
import { SongCard } from "./SongCard";
import { toast } from "sonner";
import { 
  Music2, 
  Lock, 
  Globe, 
  Share2, 
  Copy, 
  ArrowLeft,
  ListMusic
} from "lucide-react";

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

interface PlaylistViewProps {
  playlist: Playlist;
  pin: string | null;
  onSongAdded: () => void;
  onSongRemoved: () => void;
}

export function PlaylistView({ playlist, pin, onSongAdded, onSongRemoved }: PlaylistViewProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [draggedSongId, setDraggedSongId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    
    const url = `${window.location.origin}/${playlist.slug}`;
    const shareText = playlist.isPrivate 
      ? `Check out my playlist "${playlist.name}"!\n\nLink: ${url}\nPIN: ${pin}`
      : `Check out my playlist "${playlist.name}"!\n\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: playlist.name,
          text: shareText,
          url: url,
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Link copied to clipboard!", {
          description: playlist.isPrivate ? "PIN included in copied text" : undefined,
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(shareText);
          toast.success("Link copied to clipboard!");
        } catch {
          toast.error("Failed to share");
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/${playlist.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      const url = new URL(`/api/playlists/${playlist.slug}/songs`, window.location.origin);
      url.searchParams.set("songId", songId);
      if (pin) {
        url.searchParams.set("pin", pin);
      }

      const response = await fetch(url.toString(), {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove song");
      }

      toast.success("Song removed");
      onSongRemoved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove song");
    }
  };

  const handleDragStart = (songId: string) => {
    setDraggedSongId(songId);
  };

  const handleDragEnd = () => {
    setDraggedSongId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const songId = e.dataTransfer.getData("text/plain");
    if (songId && songId !== playlist.songs[index]?.id) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const songId = e.dataTransfer.getData("text/plain") || draggedSongId;
    if (songId && songId !== playlist.songs[index]?.id) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    // Only clear if we're actually leaving the element bounds
    if (x < rect.left - 10 || x > rect.right + 10 || y < rect.top - 10 || y > rect.bottom + 10) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedSongId = e.dataTransfer.getData("text/plain") || draggedSongId;
    if (!droppedSongId) {
      console.log("No dropped song ID");
      return;
    }

    const draggedIndex = playlist.songs.findIndex(s => s.id === droppedSongId);
    if (draggedIndex === -1) {
      console.log("Dragged song not found");
      setDraggedSongId(null);
      setDragOverIndex(null);
      return;
    }

    // If dropped on the same position, do nothing
    if (draggedIndex === dropIndex) {
      console.log("Dropped on same position");
      setDraggedSongId(null);
      setDragOverIndex(null);
      return;
    }

    console.log(`Moving song from index ${draggedIndex} to ${dropIndex}`);

    // Create new order
    const newSongs = [...playlist.songs];
    const [draggedSong] = newSongs.splice(draggedIndex, 1);
    newSongs.splice(dropIndex, 0, draggedSong);
    const newOrder = newSongs.map(s => s.id);

    setIsReordering(true);
    const currentDraggedId = draggedSongId;
    setDraggedSongId(null);
    setDragOverIndex(null);

    try {
      const response = await fetch(`/api/playlists/${playlist.slug}/songs`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songIds: newOrder,
          pin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reorder songs");
      }

      toast.success("Playlist reordered");
      onSongAdded(); // Refresh the playlist
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reorder songs");
      setDraggedSongId(currentDraggedId);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Music2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{playlist.name}</h1>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1.5">
                  {playlist.isPrivate ? (
                    <>
                      <Lock className="h-3 w-3" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      Public
                    </>
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyLink}
              className="hover:text-foreground"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button size="sm" onClick={handleShare} disabled={isSharing}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <SongSearch
          playlistSlug={playlist.slug}
          pin={pin}
          onSongAdded={onSongAdded}
        />
      </div>

      {/* Songs List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ListMusic className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Songs</h2>
        </div>

        {playlist.songs.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border">
            <Music2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No songs yet</h3>
            <p className="text-muted-foreground text-sm">
              Search for songs above to start building your playlist
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {playlist.songs.map((song, index) => {
              const isDragged = draggedSongId === song.id;
              const isDragOver = dragOverIndex === index && !isDragged;
              
              return (
                <div
                  key={song.id}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className="relative min-h-[80px]"
                >
                  {isDragOver && (
                    <>
                      <div className="absolute -top-1.5 left-0 right-0 h-1 bg-primary rounded-full z-10 shadow-lg shadow-primary/50" />
                      <div className="absolute inset-0 border-2 border-primary/30 rounded-xl z-0 pointer-events-none" />
                    </>
                  )}
                  <SongCard
                    song={song}
                    index={index + 1}
                    onRemove={() => handleRemoveSong(song.id)}
                    isDragging={isDragged}
                    dragHandleProps={{
                      draggable: !isReordering,
                      onDragStart: () => handleDragStart(song.id),
                      onDragEnd: handleDragEnd,
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

