import './Badge.css';

const MOVE_VARIANTS = {
  'they-say': { label: 'They Say', className: 'badge--they-say' },
  'i-say':    { label: 'I Say',    className: 'badge--i-say' },
  'so-what':  { label: 'So What',  className: 'badge--so-what' },
};

const REACTION_VARIANTS = {
  'shifts':   { label: 'Shifts something',     className: 'badge--shifts' },
  'pushback': { label: 'Push back',            className: 'badge--pushback' },
  'new':      { label: 'Hadn\'t thought of this', className: 'badge--new-thought' },
};

const COMMENT_VARIANTS = {
  'extending':    { label: 'Extending',    className: 'badge--extending' },
  'complicating': { label: 'Complicating', className: 'badge--complicating' },
  'questioning':  { label: 'Questioning',  className: 'badge--questioning' },
  'affirming':    { label: 'Affirming',    className: 'badge--affirming' },
};

const NOTE_VARIANTS = {
  'free':       { label: 'Free Note',       className: 'badge--free' },
  'positioned': { label: 'Positioned Note', className: 'badge--positioned' },
  'reading':    { label: 'Reading Note',    className: 'badge--reading' },
  'link':       { label: 'Link Save',       className: 'badge--link' },
};

export default function Badge({
  type = 'move',           // move | reaction | comment | note | custom
  variant,                 // specific variant within type
  label: customLabel,      // custom label override
  size = 'sm',             // sm | md
  className = '',
}) {
  let config = {};

  if (type === 'move')     config = MOVE_VARIANTS[variant] || {};
  if (type === 'reaction') config = REACTION_VARIANTS[variant] || {};
  if (type === 'comment')  config = COMMENT_VARIANTS[variant] || {};
  if (type === 'note')     config = NOTE_VARIANTS[variant] || {};

  const displayLabel = customLabel || config.label || variant;
  const variantClass = config.className || '';

  const classes = [
    'badge',
    `badge--${size}`,
    variantClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {displayLabel}
    </span>
  );
}
