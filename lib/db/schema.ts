import { pgTable, uuid, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  isPrivate: boolean("is_private").notNull().default(false),
  pin: text("pin"), // 4-digit PIN if private, null if public
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const songs = pgTable("songs", {
  id: uuid("id").primaryKey().defaultRandom(),
  playlistId: uuid("playlist_id")
    .notNull()
    .references(() => playlists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  coverImageUrl: text("cover_image_url"),
  lyrics: text("lyrics"),
  itunesId: text("itunes_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  order: integer("order").notNull().default(0),
});

// Relations
export const playlistsRelations = relations(playlists, ({ many }) => ({
  songs: many(songs),
}));

export const songsRelations = relations(songs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [songs.playlistId],
    references: [playlists.id],
  }),
}));

// Types
export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;

