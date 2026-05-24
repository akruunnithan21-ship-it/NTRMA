import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

export default function Modal({ open, onClose, title, children, actions }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/15 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-sm glass-card-static p-6 animate-fade-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-pink-50 transition-colors"
        >
          <X size={16} className="text-text-secondary" />
        </button>

        {/* Title */}
        {title && (
          <h3 className="text-base font-semibold tracking-wider text-text-primary mb-4">
            {title}
          </h3>
        )}

        {/* Content */}
        <div className="text-sm text-text-secondary leading-relaxed">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 mt-6">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}
