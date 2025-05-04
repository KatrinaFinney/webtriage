export function useHaptic() {
    return (pattern: number | number[]) => {
      if (typeof window !== 'undefined'
          && 'vibrate' in navigator
          && window.matchMedia('(hover: none)').matches) {
        navigator.vibrate(pattern);
      }
    };
  }