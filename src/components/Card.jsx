import './Card.css';

export default function Card({
  children,
  variant = 'default',  // default | elevated | bordered
  padding = 'md',       // sm | md | lg | none
  as: Tag = 'div',
  onClick,
  hoverable = false,
  className = '',
  ...props
}) {
  const classes = [
    'card',
    `card--${variant}`,
    `card--pad-${padding}`,
    hoverable && 'card--hoverable',
    onClick && 'card--clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={classes} onClick={onClick} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`card__header ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`card__body ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`card__footer ${className}`} {...props}>
      {children}
    </div>
  );
}
