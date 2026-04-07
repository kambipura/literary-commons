import './Avatar.css';

const PALETTE = [
  '#c84b2f', '#b8963e', '#6b7fb5', '#4a7c59',
  '#7a6e5d', '#8b5e3c', '#5a7a8b', '#9b6b8e',
];

function getColour(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({
  name = '',
  src,
  size = 'md',     // sm | md | lg | xl
  className = '',
}) {
  const initials = getInitials(name);
  const colour = getColour(name);

  const classes = [
    'avatar',
    `avatar--${size}`,
    className,
  ].filter(Boolean).join(' ');

  if (src) {
    return (
      <div className={classes}>
        <img src={src} alt={name} className="avatar__img" />
      </div>
    );
  }

  return (
    <div
      className={classes}
      style={{ backgroundColor: colour }}
      title={name}
    >
      <span className="avatar__initials">{initials}</span>
    </div>
  );
}
