import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists, songs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const pin = request.nextUrl.searchParams.get("pin");

    const playlist = await db.query.playlists.findFirst({
      where: eq(playlists.slug, slug),
      with: {
        songs: {
          orderBy: (songs, { asc }) => [asc(songs.order)],
        },
      },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // If private, verify PIN
    if (playlist.isPrivate) {
      if (!pin) {
        return NextResponse.json(
          { error: "PIN required", requiresPin: true },
          { status: 401 }
        );
      }
      if (pin !== playlist.pin) {
        return NextResponse.json(
          { error: "Invalid PIN" },
          { status: 401 }
        );
      }
    }

    // Don't expose the PIN in the response
    return NextResponse.json({
      id: playlist.id,
      name: playlist.name,
      slug: playlist.slug,
      isPrivate: playlist.isPrivate,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      songs: playlist.songs,
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, pin } = body;

    // Find the playlist
    const playlist = await db.query.playlists.findFirst({
      where: eq(playlists.slug, slug),
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // If private, verify PIN
    if (playlist.isPrivate) {
      if (!pin) {
        return NextResponse.json(
          { error: "PIN required" },
          { status: 401 }
        );
      }
      if (pin !== playlist.pin) {
        return NextResponse.json(
          { error: "Invalid PIN" },
          { status: 401 }
        );
      }
    }

    // Update playlist
    const [updatedPlaylist] = await db
      .update(playlists)
      .set({
        name: name?.trim() || playlist.name,
        updatedAt: new Date(),
      })
      .where(eq(playlists.slug, slug))
      .returning();

    return NextResponse.json({
      id: updatedPlaylist.id,
      name: updatedPlaylist.name,
      slug: updatedPlaylist.slug,
      isPrivate: updatedPlaylist.isPrivate,
      updatedAt: updatedPlaylist.updatedAt,
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: "Failed to update playlist" },
      { status: 500 }
    );
  }
}

