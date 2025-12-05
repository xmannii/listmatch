"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Plus, Loader2, Music, X } from "lucide-react";
import Image from "next/image";

interface SearchResult {
  itunesId: string;
  title: string;
  artist: string;
  album: string;
  coverImageUrl: string | null;
}

interface SongSearchProps {
  playlistSlug: string;
  pin: string | null;
  onSongAdded: () => void;
}

export function SongSearch({ playlistSlug, pin, onSongAdded }: SongSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Search failed");
        
        const data = await response.json();
        setResults(data.songs || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search songs");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleAddSong = async (song: SearchResult) => {
    setAddingId(song.itunesId);
    
    try {
      const response = await fetch(`/api/playlists/${playlistSlug}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
          album: song.album,
          coverImageUrl: song.coverImageUrl,
          itunesId: song.itunesId,
          pin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add song");
      }

      toast.success(`Added "${song.title}"`);
      onSongAdded();
      setQuery("");
      setResults([]);
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add song");
    } finally {
      setAddingId(null);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for songs to add..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 h-12 bg-card/80 border-border/50"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {results.map((song) => (
            <div
              key={song.itunesId}
              className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
            >
              {/* Album Art */}
              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                {song.coverImageUrl ? (
                  <Image
                    src={song.coverImageUrl}
                    alt={song.album}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {song.artist} • {song.album}
                </p>
              </div>

              {/* Add Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAddSong(song)}
                disabled={addingId === song.itunesId}
                className="shrink-0"
              >
                {addingId === song.itunesId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-6 z-50 text-center">
          <Music className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No songs found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

