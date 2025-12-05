import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists } from "@/lib/db/schema";
import { nanoid } from "nanoid";

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateSlug(): string {
  return nanoid(8);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isPrivate } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Playlist name is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug();
    const pin = isPrivate ? generatePin() : null;

    const [playlist] = await db
      .insert(playlists)
      .values({
        name: name.trim(),
        isPrivate: Boolean(isPrivate),
        pin,
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

