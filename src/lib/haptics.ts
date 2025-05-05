/* ------------------------------------------------------------------
   Haptics helper – safely wraps navigator.vibrate
------------------------------------------------------------------- */
export type Haptic =
  | 'start'
  | 'ping'
  | 'success'
  | 'error';

const patterns: Record<Haptic, number | number[]> = {
  start   : 50,
  ping    : [10, 40],
  success : [30, 30, 30],
  error   : [120, 60, 120],
};

export function vibrate(type: Haptic) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(patterns[type]);
  }
}
