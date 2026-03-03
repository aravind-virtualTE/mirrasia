import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ComponentProps, ReactNode } from "react"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  loadingText?: string
  confirmVariant?: ComponentProps<typeof Button>["variant"]
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Working...",
  confirmVariant = "destructive",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isLoading) return
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingText}
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
