export const FORMAT_INTERACTIVE = 'Interactive (Audio & Animation)';
export const FORMAT_STATIC = 'Static Comic (Downloadable)';

export function isInteractiveFormat(format?: string): boolean {
  if (!format) return true;
  return format.includes('Interactive');
}
