/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { FileText, Maximize2, Trash, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CommentsDrawer from "./CommentsDrawer";
import { Document, DocumentComment } from "./cdm";

interface DocumentTableWithCommentsProps {
  documents: Document[];
  commentsMap: Record<string, DocumentComment[]>;
  onToggleExpand: (doc: Document) => void;
  onConfirmDelete: (doc: Document) => void;
  onAddComment: (docId: string, text: string) => Promise<void>;
  onEditComment: (docId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (docId: string, commentId: string) => Promise<void>;
  currentUserId?: string;
  isUpdating?: boolean;
  expandedDoc?: Document | null;
}

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
};

const DocumentTableWithComments: React.FC<DocumentTableWithCommentsProps> = ({
  documents,
  commentsMap,
  onToggleExpand,
  onConfirmDelete,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUserId,
  isUpdating = false,
  expandedDoc,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openComments = (doc: Document) => {
    setSelectedDoc(doc);
    setDrawerOpen(true);
  };

  const getSafeId = (doc: Document) =>
    ((doc?._id as any)?.toString?.() || (doc.id as any)?.toString?.() || "unknown-id").toLowerCase();

  const getCommentCount = (doc: Document) => {
    const docId = getSafeId(doc);
    return commentsMap[docId]?.length || 0;
  };

  const getLatestComment = (doc: Document) => {
    const docId = getSafeId(doc);
    const list = commentsMap[docId] || [];
    if (!list.length) return null;
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  if (expandedDoc) return null;

  return (
    <>
      <div className="rounded-md border">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[30%]">Document Name</TableHead>
              <TableHead className="w-[15%]">Uploaded By</TableHead>
              <TableHead className="w-[15%]">Created At</TableHead>
              <TableHead className="w-[13%] text-center">Comments</TableHead>
              <TableHead className="w-[13%] text-center">View</TableHead>
              <TableHead className="w-[14%] text-center">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-6"
                >
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => {
                const commentCount = getCommentCount(document);
                const latestComment = getLatestComment(document);
                const latestCommentPreview = latestComment
                  ? `${latestComment.createdByName || "User"}: ${latestComment.text}`
                  : "No comments yet";
                return (
                  <TableRow key={getSafeId(document)}>
                    <TableCell className="py-3">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <div
                            className="font-medium truncate"
                            title={document.docName}
                          >
                            {document.docName}
                          </div>
                          {document.docUrl && (
                            <a
                              href={document.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline text-muted-foreground hover:text-foreground"
                            >
                              Open in new tab
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 align-middle text-sm">
                      {document.uploadedBy?.trim() || "N/A"}
                    </TableCell>

                    <TableCell className="py-3 align-middle text-sm">
                      {formatDate(document.createdAt)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openComments(document)}
                        className="inline-flex items-center gap-1.5"
                        disabled={isUpdating}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {commentCount > 0 && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                            {commentCount}
                          </Badge>
                        )}
                      </Button>
                      <div className="mt-1 text-left text-[11px] text-muted-foreground px-1">
                        <span className="block truncate" title={latestCommentPreview}>
                          {latestCommentPreview}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onToggleExpand(document)}
                        className="inline-flex items-center gap-1"
                        disabled={isUpdating}
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onConfirmDelete(document)}
                        className="inline-flex items-center gap-1"
                        disabled={isUpdating}
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CommentsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        document={selectedDoc}
        comments={selectedDoc ? commentsMap[getSafeId(selectedDoc)] || [] : []}
        onAddComment={(text) =>
          selectedDoc ? onAddComment(getSafeId(selectedDoc), text) : Promise.resolve()
        }
        onEditComment={(commentId, text) =>
          selectedDoc
            ? onEditComment(getSafeId(selectedDoc), commentId, text)
            : Promise.resolve()
        }
        onDeleteComment={(commentId) =>
          selectedDoc
            ? onDeleteComment(getSafeId(selectedDoc), commentId)
            : Promise.resolve()
        }
        currentUserId={currentUserId}
      />
    </>
  );
};

export default DocumentTableWithComments;
