import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, songs, playlists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await params;

    const songComments = await db.query.comments.findMany({
      where: eq(comments.songId, songId),
      orderBy: (comments, { desc }) => [desc(comments.createdAt)],
    });

    return NextResponse.json(songComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await params;
    const body = await request.json();
    const { authorName, content } = body;

    if (!authorName || !content) {
      return NextResponse.json(
        { error: "Author name and content are required" },
        { status: 400 }
      );
    }

    if (authorName.trim().length === 0 || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Author name and content cannot be empty" },
        { status: 400 }
      );
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { error: "Comment must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Verify song exists
    const song = await db.query.songs.findFirst({
      where: eq(songs.id, songId),
    });

    if (!song) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    // Create comment
    const [comment] = await db
      .insert(comments)
      .values({
        songId,
        authorName: authorName.trim(),
        content: content.trim(),
      })
      .returning();

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

