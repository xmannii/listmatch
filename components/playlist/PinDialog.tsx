"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowRight } from "lucide-react";

interface PinDialogProps {
  onSubmit: (pin: string) => void;
  error?: string | null;
}

export function PinDialog({ onSubmit, error }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4) {
      setIsSubmitting(true);
      onSubmit(pin);
      // Reset submitting state after a short delay if there's an error
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
  };

  return (
    <Card className="w-full max-w-sm border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl">Private Playlist</CardTitle>
        <CardDescription>
          Enter the 4-digit PIN to access this playlist
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="• • • •"
              value={pin}
              onChange={handlePinChange}
              className="h-14 text-center text-2xl font-mono tracking-[0.5em] bg-background/50"
              maxLength={4}
              autoFocus
            />
            {error && error !== "PIN required" && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={pin.length !== 4 || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Access Playlist
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

