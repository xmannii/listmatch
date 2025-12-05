import { NextRequest, NextResponse } from "next/server";

interface iTunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  artworkUrl60: string;
}

interface iTunesResponse {
  resultCount: number;
  results: iTunesResult[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodedQuery}&media=music&entity=song&limit=20`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("iTunes API request failed");
    }

    const data: iTunesResponse = await response.json();

    // Transform the response to our format
    const songs = data.results.map((track) => ({
      itunesId: track.trackId.toString(),
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      // Get higher resolution artwork by replacing 100x100 with 600x600
      coverImageUrl: track.artworkUrl100?.replace("100x100bb", "600x600bb") || null,
    }));

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Error searching songs:", error);
    return NextResponse.json(
      { error: "Failed to search songs" },
      { status: 500 }
    );
  }
}

