import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists, songs } from "@/lib/db/schema";
import { eq, and, max, inArray } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, artist, album, coverImageUrl, itunesId, pin } = body;

    if (!title || !artist) {
      return NextResponse.json(
        { error: "Title and artist are required" },
        { status: 400 }
      );
    }

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

    // Get the current max order for this playlist
    const maxOrderResult = await db
      .select({ maxOrder: max(songs.order) })
      .from(songs)
      .where(eq(songs.playlistId, playlist.id));

    const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

    // Insert the song
    const [song] = await db
      .insert(songs)
      .values({
        playlistId: playlist.id,
        title: title.trim(),
        artist: artist.trim(),
        album: album?.trim() || null,
        coverImageUrl: coverImageUrl || null,
        itunesId: itunesId || null,
        order: nextOrder,
      })
      .returning();

    // Update playlist's updatedAt
    await db
      .update(playlists)
      .set({ updatedAt: new Date() })
      .where(eq(playlists.id, playlist.id));

    return NextResponse.json(song);
  } catch (error) {
    console.error("Error adding song:", error);
    return NextResponse.json(
      { error: "Failed to add song" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get("songId");
    const pin = searchParams.get("pin");

    if (!songId) {
      return NextResponse.json(
        { error: "Song ID is required" },
        { status: 400 }
      );
    }

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

    // Delete the song (only if it belongs to this playlist)
    const deleted = await db
      .delete(songs)
      .where(and(eq(songs.id, songId), eq(songs.playlistId, playlist.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Song not found in this playlist" },
        { status: 404 }
      );
    }

    // Update playlist's updatedAt
    await db
      .update(playlists)
      .set({ updatedAt: new Date() })
      .where(eq(playlists.id, playlist.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing song:", error);
    return NextResponse.json(
      { error: "Failed to remove song" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { songIds, pin } = body;

    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json(
        { error: "Song IDs array is required" },
        { status: 400 }
      );
    }

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

    // Verify all songs belong to this playlist
    const playlistSongs = await db
      .select()
      .from(songs)
      .where(
        and(
          eq(songs.playlistId, playlist.id),
          inArray(songs.id, songIds)
        )
      );

    if (playlistSongs.length !== songIds.length) {
      return NextResponse.json(
        { error: "Some songs don't belong to this playlist" },
        { status: 400 }
      );
    }

    // Update order for each song
    const updates = songIds.map((songId: string, index: number) =>
      db
        .update(songs)
        .set({ order: index })
        .where(and(eq(songs.id, songId), eq(songs.playlistId, playlist.id)))
    );

    await Promise.all(updates);

    // Update playlist's updatedAt
    await db
      .update(playlists)
      .set({ updatedAt: new Date() })
      .where(eq(playlists.id, playlist.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering songs:", error);
    return NextResponse.json(
      { error: "Failed to reorder songs" },
      { status: 500 }
    );
  }
}

