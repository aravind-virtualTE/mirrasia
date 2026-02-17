import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Pencil, X, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  const MAX_COMMENT_LEN = 2000;
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [comments]
  );

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
    const nextText = String(editText || "").trim();
    if (!nextText) return;
    setSubmitting(true);
    try {
      await onEditComment(commentId, nextText);
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
    setEditText(String(comment?.text || ""));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
  };

  const getInitial = (name?: string) => {
    const safe = String(name || "").trim();
    return safe ? safe.charAt(0).toUpperCase() : "?";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:w-[600px] flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-lg">Document Comments</SheetTitle>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground truncate" title={document?.docName}>
              {document?.docName || "Document"}
            </p>
            <Badge variant="secondary" className="w-fit">
              {sortedComments.length} comment(s)
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sortedComments.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              No comments yet. Add the first note for this document.
            </div>
          ) : (
            sortedComments.map((comment) => {
              const isOwn = String(currentUserId || "") === String(comment.createdBy || "");
              return (
              <div
                key={comment._id}
                className={cn(
                  "rounded-lg border p-3 space-y-2",
                  isOwn ? "bg-primary/5 border-primary/20" : "bg-card"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {getInitial(comment.createdByName)}
                      </span>
                      <p className="text-sm font-medium truncate">
                        {comment.createdByName || "Unknown User"}
                      </p>
                      {isOwn && (
                        <Badge variant="outline" className="h-5 text-[10px]">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="ml-8 text-[11px] text-muted-foreground">{formatDate(comment.createdAt)}</p>
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
                  <div className="space-y-2">
                    <Textarea
                      value={String(editText || "")}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[90px] text-sm"
                      disabled={submitting}
                      maxLength={MAX_COMMENT_LEN}
                    />
                    <div className="text-right text-[11px] text-muted-foreground">
                      {String(editText || "").length}/{MAX_COMMENT_LEN}
                    </div>
                  </div>
                ) : (
                  <p className="ml-8 text-sm whitespace-pre-wrap break-words">{String(comment?.text || "")}</p>
                )}
              </div>
            );
            })
          )}
        </div>

        <div className="border-t pt-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Notes here help keep document review history clear for users, admins, and masters.
          </p>
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
            disabled={submitting}
            maxLength={MAX_COMMENT_LEN}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {newComment.length}/{MAX_COMMENT_LEN}
            </span>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || submitting}
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentsDrawer;
