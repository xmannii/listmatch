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
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    if (isPrivate && pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          isPrivate,
          pin: isPrivate ? pin : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create playlist");
      }

      const playlist = await response.json();
      toast.success("Playlist created!");

      // Navigate to the playlist page
      router.push(`/${playlist.slug}${playlist.isPrivate ? `?pin=${playlist.pin}` : ""}`);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="space-y-1 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Music2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Create Playlist</CardTitle>
            <CardDescription className="text-xs">
              Start a new collaborative playlist
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-3">
            <Label className="text-sm font-medium">Visibility</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Public Option */}
              <button
                type="button"
                onClick={() => {
                  setIsPrivate(false);
                  setPin("");
                }}
                disabled={isLoading}
                className={`
                  relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all
                  ${!isPrivate
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center gap-2">
                  <Globe className={`h-4 w-4 ${!isPrivate ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${!isPrivate ? "text-primary" : "text-foreground"}`}>
                    Public
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anyone with the link can view and edit
                </p>
                {!isPrivate && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>

              {/* Private Option */}
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                disabled={isLoading}
                className={`
                  relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all
                  ${isPrivate
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center gap-2">
                  <Lock className={`h-4 w-4 ${isPrivate ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${isPrivate ? "text-primary" : "text-foreground"}`}>
                    Private
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Protected with a PIN
                </p>
                {isPrivate && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            </div>

            {/* PIN Field with smooth transition */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isPrivate ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-2 pt-1">
                <Label htmlFor="pin" className="text-sm font-medium">
                  4-Digit PIN
                </Label>
                <Input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="• • • •"
                  value={pin}
                  onChange={handlePinChange}
                  className="h-11 text-center text-xl font-mono tracking-[0.5em] bg-background/50"
                  maxLength={4}
                  disabled={isLoading}
                  autoFocus={isPrivate && pin.length === 0}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a 4-digit PIN to protect your playlist
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={isLoading || !name.trim() || (isPrivate && pin.length !== 4)}
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

