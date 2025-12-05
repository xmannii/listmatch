import type { Metadata } from "next";
import { db } from "@/lib/db";
import { playlists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const playlist = await db.query.playlists.findFirst({
      where: eq(playlists.slug, slug),
      with: {
        songs: true,
      },
    });

    if (!playlist) {
      return {
        title: "Playlist Not Found - Playlist Matcher",
        description: "This playlist doesn't exist or has been deleted.",
      };
    }

    // Don't expose private playlist details in metadata
    if (playlist.isPrivate) {
      return {
        title: "Private Playlist - Playlist Matcher",
        description: "This is a private playlist. Enter the PIN to view.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Get song count from the relation
    const songCount = playlist.songs?.length || 0;

    const description = playlist.description 
      ? `${playlist.description} • ${songCount} ${songCount === 1 ? 'song' : 'songs'}`
      : `A collaborative playlist with ${songCount} ${songCount === 1 ? 'song' : 'songs'}. Create and share playlists with friends.`;

    return {
      title: `${playlist.name} - Playlist Matcher`,
      description,
      openGraph: {
        title: playlist.name,
        description: playlist.description || `A collaborative playlist with ${songCount} ${songCount === 1 ? 'song' : 'songs'}.`,
        type: "website",
        siteName: "Playlist Matcher",
      },
      twitter: {
        card: "summary_large_image",
        title: playlist.name,
        description: playlist.description || `A collaborative playlist with ${songCount} ${songCount === 1 ? 'song' : 'songs'}.`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Playlist - Playlist Matcher",
      description: "View and collaborate on playlists with friends.",
    };
  }
}

export default function PlaylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

