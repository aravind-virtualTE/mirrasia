import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Pencil, X, Check, Loader2 } from "lucide-react";
import type { DocumentComment, Document } from "./cdm";

interface CommentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  comments: DocumentComment[];
  onAddComment: (text: string) => Promise<void>;
  onEditComment: (commentId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  currentUserId?: string;
  isLoading?: boolean;
}

const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  open,
  onOpenChange,
  document,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUserId,
  isLoading = false,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    setSubmitting(true);
    try {
      await onEditComment(commentId, editText.trim());
      setEditingId(null);
      setEditText("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setSubmitting(true);
    try {
      await onDeleteComment(commentId);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment: DocumentComment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-lg">
            Comments for "{document?.docName || "Document"}"
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Be the first to add one!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="rounded-lg border bg-card p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {comment.createdByName || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>

                  {currentUserId === comment.createdBy && (
                    <div className="flex gap-1 shrink-0">
                      {editingId === comment._id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleSaveEdit(comment._id)}
                            disabled={submitting}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={cancelEdit}
                            disabled={submitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEdit(comment)}
                            disabled={submitting}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(comment._id)}
                            disabled={submitting}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {editingId === comment._id ? (
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[80px] text-sm"
                    disabled={submitting}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add new comment */}
        <div className="border-t pt-4 space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
            disabled={submitting}
          />
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
            className="w-full"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </span>
            ) : (
              "Add Comment"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentsDrawer;
