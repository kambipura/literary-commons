/**
 * Utility functions for formatting and consistent UI labels.
 * These replace the dependencies on mock.js for the live application.
 */

/**
 * Format a date string (ISO or otherwise) into a human-readable date.
 * Example: 2026-01-30 -> Jan 30, 2026
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

/**
 * Format a date string into a human-readable time.
 * Example: 10:15 AM
 */
export function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Format a date string relative to "now".
 * Example: "2h ago", "just now"
 */
export function formatRelative(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

/**
 * Generate a descriptive label for a reflection's response source.
 */
export function getResponseSourceLabel(source, context = {}) {
  if (!source) return '';
  
  if (source.type === 'prompt') {
    return `Responding to session prompt: "${context.sessionTitle || 'Class Session'}"`;
  }
  
  if (source.type === 'classmate') {
    return `Responding to ${source.authorName || 'a classmate'}: "${source.reflectionTitle || 'Reflection'}"`;
  }
  
  if (source.type === 'passage') {
    const text = source.text || '';
    return `Responding to: ${text.length > 80 ? text.slice(0, 80) + '…' : text}`;
  }
  
  if (source.type === 'free') {
    return source.text || '';
  }
  
  return '';
}

export const PROMPT_TYPES = {
  'they-say': { label: 'Structured Response', icon: '🗣️' },
  'reading': { label: 'Reading Response', icon: '📖' },
  'open': { label: 'Open Reflection', icon: '💭' },
  'peer': { label: 'Peer Review', icon: '👥' }
};
