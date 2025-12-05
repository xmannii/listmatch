"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Trash2, Loader2, GripVertical, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  coverImageUrl: string | null;
  itunesId: string | null;
  createdAt: string;
  order: number;
  comments?: Comment[];
}

interface SongCardProps {
  song: Song;
  index: number;
  onRemove: () => void;
  isDragging?: boolean;
  dragHandleProps?: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
  onCommentAdded?: () => void;
}

export function SongCard({ song, index, onRemove, isDragging, dragHandleProps, onCommentAdded }: SongCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [comments, setComments] = useState<Comment[]>(song.comments || []);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    if (song.comments) {
      setComments(song.comments);
    }
  }, [song.comments]);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove();
    setIsRemoving(false);
  };

  const toggleCommentForm = async () => {
    if (!showCommentForm) {
      // Load fresh comments when opening form
      setIsLoadingComments(true);
      try {
        const response = await fetch(`/api/songs/${song.id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowCommentForm(!showCommentForm);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentName.trim() || !commentContent.trim()) {
      toast.error("Please fill in both name and comment");
      return;
    }

    if (commentContent.trim().length > 500) {
      toast.error("Comment must be 500 characters or less");
      return;
    }

    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/songs/${song.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: commentName.trim(),
          content: commentContent.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add comment");
      }

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setCommentName("");
      setCommentContent("");
      toast.success("Comment added!");
      onCommentAdded?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add comment");
    } finally {
      setIsAddingComment(false);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 2);
  const hasMoreComments = comments.length > 2;
  const hasComments = comments.length > 0;

  return (
    <div 
      className={`song-card group rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm transition-all overflow-hidden ${
        isDragging ? "opacity-50 scale-95 cursor-grabbing" : ""
      }`}
      draggable={dragHandleProps?.draggable || false}
      onDragStart={(e) => {
        if (!dragHandleProps) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", song.id);
        e.dataTransfer.setData("application/json", JSON.stringify({ songId: song.id }));
        dragHandleProps.onDragStart(e);
      }}
      onDragEnd={(e) => {
        if (!dragHandleProps) return;
        dragHandleProps.onDragEnd(e);
      }}
    >
      {/* Main Song Card */}
      <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
      {/* Drag Handle */}
      {dragHandleProps && (
        <div
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none pointer-events-none hidden sm:block"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      {/* Index */}
      <div className="w-5 sm:w-6 text-center text-xs sm:text-sm text-muted-foreground font-mono shrink-0">
        {index}
      </div>

      {/* Album Art */}
      <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden bg-muted shrink-0">
        {song.coverImageUrl ? (
          <Image
            src={song.coverImageUrl}
            alt={song.album || song.title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{song.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist}
          {song.album && <span className="hidden sm:inline"> • {song.album}</span>}
        </p>
      </div>

      {/* Actions */}
      <div 
        className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={(e) => e.stopPropagation()}
      >
        {/* Comments Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleCommentForm}
          disabled={isLoadingComments}
          className="h-9 w-9 p-0"
          onDragStart={(e) => e.stopPropagation()}
          title={showCommentForm ? "Close comments" : "Add comment"}
        >
          {isLoadingComments ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className={`h-4 w-4 ${hasComments ? "text-primary" : ""}`} />
          )}
        </Button>

        {/* Remove Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          disabled={isRemoving}
          className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onDragStart={(e) => e.stopPropagation()}
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      </div>

      {/* Comments Section - Always visible if comments exist */}
      {hasComments && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-border/30 bg-muted/20">
          <div className="space-y-3 pt-3">
            {displayedComments.map((comment) => {
              const initial = comment.authorName.charAt(0).toUpperCase();
              // Generate color based on name
              let hash = 0;
              for (let i = 0; i < comment.authorName.length; i++) {
                hash = comment.authorName.charCodeAt(i) + ((hash << 5) - hash);
              }
              const hue = Math.abs(hash % 360);
              const bgColor = `oklch(0.6 0.25 ${hue})`;
              
              return (
                <div key={comment.id} className="flex gap-2 sm:gap-3">
                  {/* Avatar */}
                  <div 
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: bgColor }}
                  >
                    {initial}
                  </div>
                  
                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground mb-1 break-words">{comment.authorName}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">{comment.content}</p>
                  </div>
                </div>
              );
            })}
            
            {hasMoreComments && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 w-full pt-1"
              >
                <ChevronDown className="h-3 w-3" />
                Show {comments.length - 2} more {comments.length - 2 === 1 ? "comment" : "comments"}
              </button>
            )}
            
            {hasMoreComments && showAllComments && (
              <>
                {comments.slice(2).map((comment) => {
                  const initial = comment.authorName.charAt(0).toUpperCase();
                  let hash = 0;
                  for (let i = 0; i < comment.authorName.length; i++) {
                    hash = comment.authorName.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  const hue = Math.abs(hash % 360);
                  const bgColor = `oklch(0.6 0.25 ${hue})`;
                  
                  return (
                    <div key={comment.id} className="flex gap-2 sm:gap-3">
                      {/* Avatar */}
                      <div 
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: bgColor }}
                      >
                        {initial}
                      </div>
                      
                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground mb-1 break-words">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed break-words">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => setShowAllComments(false)}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 w-full pt-1"
                >
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Comment Form Section */}
      {showCommentForm && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-border/30 bg-muted/20">
          <form onSubmit={handleAddComment} className="space-y-2 pt-3">
            <Input
              type="text"
              placeholder="Your name"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="h-8 text-xs"
              maxLength={50}
              disabled={isAddingComment}
            />
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="h-8 text-xs flex-1"
                maxLength={500}
                disabled={isAddingComment}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isAddingComment || !commentName.trim() || !commentContent.trim()}
                className="h-8 px-3 text-xs shrink-0"
              >
                {isAddingComment ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

