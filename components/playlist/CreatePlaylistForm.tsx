"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Music2, Lock, Globe, Sparkles } from "lucide-react";

export function CreatePlaylistForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), isPrivate }),
      });

      if (!response.ok) {
        throw new Error("Failed to create playlist");
      }

      const playlist = await response.json();

      if (playlist.isPrivate && playlist.pin) {
        toast.success(
          `Playlist created! Your PIN is: ${playlist.pin}`,
          {
            description: "Save this PIN to share with friends",
            duration: 10000,
          }
        );
      } else {
        toast.success("Playlist created!");
      }

      // Navigate to the playlist page
      router.push(`/${playlist.slug}${playlist.isPrivate ? `?pin=${playlist.pin}` : ""}`);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Music2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Create Playlist</CardTitle>
            <CardDescription className="text-sm">
              Start a new collaborative playlist
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Playlist Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Summer Vibes 2024..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 bg-background/50"
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <Lock className="h-5 w-5 text-primary" />
              ) : (
                <Globe className="h-5 w-5 text-accent" />
              )}
              <div>
                <Label htmlFor="private" className="text-sm font-medium cursor-pointer">
                  {isPrivate ? "Private Playlist" : "Public Playlist"}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPrivate
                    ? "Protected with a 4-digit PIN"
                    : "Anyone with the link can edit"}
                </p>
              </div>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create Playlist
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

