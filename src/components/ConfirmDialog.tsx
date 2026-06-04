import AppButton from "./AppButton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  isPending?: boolean

}


export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  isPending
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          backgroundColor: 'var(--color-bg-elevated',
          border: '1px solid var(--color-border)'
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
              textTransform: 'none'
            }}
          >
            {title}
          </DialogTitle>
        </DialogHeader>
        <p
          className="text-sm mt-2 whitespace-pre-line"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>

        <div className="flex gap-3 mt-4">
          <AppButton
            variant="ghost"
            fullWidth
            onClick={() => onOpenChange(false)}
          >
            cancelar
          </AppButton>
          <AppButton
            variant="danger"
            fullWidth
            onClick={onConfirm}
            isPending={isPending}
            pendingLabel="Eliminando..."
          >
            {confirmLabel}
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}