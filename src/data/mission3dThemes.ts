export interface MissionTheme3D {
  index: number;
  code: string;
  label: string;
  primaryHex: string;
  accentHex: string;
  studioGlow: string;
}

export const MISSION_3D_THEMES: MissionTheme3D[] = [
  { index: 0, code: '01', label: 'Women Entrepreneurship', primaryHex: '#10B981', accentHex: '#34D399', studioGlow: 'rgba(16, 185, 129, 0.34)' },
  { index: 1, code: '02', label: 'AI Free Training', primaryHex: '#06B6D4', accentHex: '#38BDF8', studioGlow: 'rgba(6, 182, 212, 0.34)' },
  { index: 2, code: '03', label: 'Everyday Essentials', primaryHex: '#E11D48', accentHex: '#FB7185', studioGlow: 'rgba(225, 29, 72, 0.36)' },
  { index: 3, code: '04', label: 'Protect the Earth', primaryHex: '#22C55E', accentHex: '#86EFAC', studioGlow: 'rgba(34, 197, 94, 0.34)' },
  { index: 4, code: '05', label: 'Hill & City Growth', primaryHex: '#3B82F6', accentHex: '#93C5FD', studioGlow: 'rgba(59, 130, 246, 0.34)' },
  { index: 5, code: '06', label: 'Sports Ecosystem', primaryHex: '#F97316', accentHex: '#FDBA74', studioGlow: 'rgba(249, 115, 22, 0.36)' },
  { index: 6, code: '07', label: 'Water Security', primaryHex: '#0EA5E9', accentHex: '#7DD3FC', studioGlow: 'rgba(14, 165, 233, 0.36)' },
  { index: 7, code: '08', label: 'Living Culture', primaryHex: '#D97706', accentHex: '#FCD34D', studioGlow: 'rgba(217, 119, 6, 0.36)' },
];
