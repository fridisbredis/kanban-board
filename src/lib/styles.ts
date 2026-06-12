export const colors = {
  cream: 'var(--cream)',
  surface: 'var(--surface)',
  border: 'var(--border)',
  borderStrong: 'var(--border-strong)',
  text: 'var(--text)',
  muted: 'var(--muted)',
  ghost: 'var(--ghost)',
  accent: 'var(--accent)',
  accentHover: 'var(--accent-hover)',
  pop: 'var(--pop)',
  // Danger palette — used for destructive actions
  dangerText: '#B45544',
  dangerBorder: '#EDD5D0',
  dangerBg: '#FDF4F3',
  dangerBgHover: '#FAE8E5',
  dangerBorderHover: '#C4704A',
  errorText: '#C4704A',
} as const;

export const overlay = {
  background: 'rgba(28,25,23,0.4)',
  backdropFilter: 'blur(4px)',
} as const;

// Shared input styles — used in modals and forms
export const inputStyle = {
  background: colors.cream,
  border: `1.5px solid ${colors.border}`,
  color: colors.text,
} as const;

export const inputClass = 'w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all';

// Card surface style — used for board cards and column panels
export const cardSurfaceStyle = {
  border: `1px solid ${colors.border}`,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
} as const;

export const COLUMN_ACCENTS = [
  '#A8CEB8', '#F0B896', '#C4B4E8', '#D8C494', '#A8C4D8', '#D8A8B4',
] as const;

export const BOARD_ACCENTS = [
  { top: '#A8CEB8', bg: '#F0F7F3' },
  { top: '#F0B896', bg: '#FEF3EC' },
  { top: '#C4B4E8', bg: '#F3F0FC' },
  { top: '#D8C494', bg: '#FAF4E4' },
  { top: '#A8C4D8', bg: '#EEF4FA' },
  { top: '#D8A8B4', bg: '#FAF0F2' },
] as const;
