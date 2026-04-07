import { useEffect, useRef } from 'react';
import './Modal.css';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',       // sm | md | lg
  className = '',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (isOpen) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e) => {
      e.preventDefault();
      onClose?.();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose?.();
    }
  };

  const classes = [
    'modal',
    `modal--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <dialog
      ref={dialogRef}
      className={classes}
      onClick={handleBackdropClick}
    >
      <div className="modal__content">
        {title && (
          <div className="modal__header">
            <h3 className="modal__title">{title}</h3>
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <div className="modal__body">
          {children}
        </div>
      </div>
    </dialog>
  );
}
