# Playlist Matcher

A collaborative playlist app built with Next.js, Drizzle ORM, and PostgreSQL. Create shared playlists with friends across any streaming platform - no authentication required!

## Features

- 🎵 **Search & Add Songs** - Search millions of songs using the iTunes API
- 🎨 **Beautiful Cover Art** - Automatically fetch album artwork for each song
- 📝 **Lyrics Support** - View lyrics for songs using Lyrics.ovh API
- 🔒 **Private Playlists** - Protect playlists with 4-digit PINs
- 🌐 **Public Sharing** - Share public playlists with anyone via link
- 👥 **Collaborative** - Multiple people can add songs to the same playlist
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui components
- **APIs**: iTunes API (song search), Lyrics.ovh (lyrics)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/xmannii/listmatch.git
cd listmatch
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/playlist_matcher
```

4. Set up the database:
```bash
pnpm db:push
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Commands

- `pnpm db:generate` - Generate migration files
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio

## How It Works

1. **Create a Playlist**: Enter a name and choose public or private
2. **Get Your Link**: Private playlists get a 4-digit PIN, public ones don't
3. **Add Songs**: Search for songs and add them to your playlist
4. **Share**: Share the link (and PIN if private) with friends
5. **Collaborate**: Anyone with the link can add songs to the playlist

## Project Structure

```
app/
  api/              # API routes
  [slug]/          # Dynamic playlist pages
  page.tsx         # Home page
components/
  playlist/        # Playlist-related components
  ui/              # shadcn UI components
lib/
  db/              # Database schema and client
```

## License

MIT
