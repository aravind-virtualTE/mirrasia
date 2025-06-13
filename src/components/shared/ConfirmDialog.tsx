import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import { ReactNode } from "react"
  
  type ConfirmDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: ReactNode
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
  }
  
  export const ConfirmDialog = ({
    open,
    onOpenChange,
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
  }: ConfirmDialogProps) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {description && <div className="text-sm text-gray-700">{description}</div>}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }