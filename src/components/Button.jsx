import './Button.css';

export default function Button({
  children,
  variant = 'primary',   // primary | secondary | ghost
  size = 'md',           // sm | md | lg
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    loading && 'btn--loading',
    icon && !children && 'btn--icon-only',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <span className="btn__dot" />
          <span className="btn__dot" />
          <span className="btn__dot" />
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn__icon">{icon}</span>
      )}
      {children && <span className="btn__label">{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn__icon">{icon}</span>
      )}
    </button>
  );
}
