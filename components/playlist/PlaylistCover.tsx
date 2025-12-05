"use client";

import { useMemo } from "react";

interface PlaylistCoverProps {
  name: string;
  size?: number;
  className?: string;
}

// Generate a gradient color based on playlist name
function generateGradient(name: string): { from: string; to: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  
  const saturation = 0.25;
  const lightness1 = 0.6;
  const lightness2 = 0.5;
  
  return {
    from: `oklch(${lightness1} ${saturation} ${hue1})`,
    to: `oklch(${lightness2} ${saturation} ${hue2})`,
  };
}

// Get initials from playlist name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return "?";
  
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function PlaylistCover({ name, size = 400, className = "" }: PlaylistCoverProps) {
  const { from, to } = useMemo(() => generateGradient(name), [name]);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div
      className={`rounded-xl overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <span
        className="text-white font-bold select-none"
        style={{
          fontSize: `${size * 0.3}px`,
          opacity: 0.9,
          lineHeight: 1,
        }}
      >
        {initials}
      </span>
    </div>
  );
}

