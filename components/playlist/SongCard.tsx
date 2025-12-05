"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Music, Trash2, Loader2, GripVertical } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  coverImageUrl: string | null;
  itunesId: string | null;
  createdAt: string;
  order: number;
}

interface SongCardProps {
  song: Song;
  index: number;
  onRemove: () => void;
  isDragging?: boolean;
  dragHandleProps?: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
}

export function SongCard({ song, index, onRemove, isDragging, dragHandleProps }: SongCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove();
    setIsRemoving(false);
  };

  return (
    <div 
      className={`song-card group flex items-center gap-4 p-4 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm transition-all ${
        isDragging ? "opacity-50 scale-95 cursor-grabbing" : ""
      }`}
      draggable={dragHandleProps?.draggable || false}
      onDragStart={(e) => {
        if (!dragHandleProps) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", song.id);
        e.dataTransfer.setData("application/json", JSON.stringify({ songId: song.id }));
        dragHandleProps.onDragStart(e);
      }}
      onDragEnd={(e) => {
        if (!dragHandleProps) return;
        dragHandleProps.onDragEnd(e);
      }}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none pointer-events-none"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

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
      <div 
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={(e) => e.stopPropagation()}
      >
        {/* Remove Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          disabled={isRemoving}
          className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onDragStart={(e) => e.stopPropagation()}
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

