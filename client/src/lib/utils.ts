// Utility functions for the application
// Note: Tailwind utilities have been removed - components now use inline styles

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
