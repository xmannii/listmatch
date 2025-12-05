import { NextRequest, NextResponse } from "next/server";

interface LyricsResponse {
  lyrics: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artist = searchParams.get("artist");
    const title = searchParams.get("title");

    if (!artist || !title) {
      return NextResponse.json(
        { error: "Artist and title are required" },
        { status: 400 }
      );
    }

    const encodedArtist = encodeURIComponent(artist.trim());
    const encodedTitle = encodeURIComponent(title.trim());

    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Lyrics not found", lyrics: null },
          { status: 404 }
        );
      }
      throw new Error("Lyrics API request failed");
    }

    const data: LyricsResponse = await response.json();

    return NextResponse.json({ lyrics: data.lyrics });
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch lyrics", lyrics: null },
      { status: 500 }
    );
  }
}

