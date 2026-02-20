import Modal from './Modal'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  title?: string
}

export default function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  title = 'Confirmar acción',
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      maxWidth={400}
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <p style={{ color: 'var(--color-cream)', fontSize: '0.9rem', lineHeight: 1.6 }}>
        {message}
      </p>
    </Modal>
  )
}