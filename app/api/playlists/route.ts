import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists } from "@/lib/db/schema";
import { nanoid } from "nanoid";

function generateSlug(): string {
  return nanoid(8);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isPrivate, pin } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Playlist name is required" },
        { status: 400 }
      );
    }

    if (isPrivate) {
      if (!pin || typeof pin !== "string" || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { error: "A valid 4-digit PIN is required for private playlists" },
          { status: 400 }
        );
      }
    }

    const slug = generateSlug();
    const playlistPin = isPrivate ? pin : null;

    const [playlist] = await db
      .insert(playlists)
      .values({
        name: name.trim(),
        isPrivate: Boolean(isPrivate),
        pin: playlistPin,
        slug,
      })
      .returning();

    return NextResponse.json({
      id: playlist.id,
      name: playlist.name,
      slug: playlist.slug,
      isPrivate: playlist.isPrivate,
      pin: playlist.pin,
      createdAt: playlist.createdAt,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}

