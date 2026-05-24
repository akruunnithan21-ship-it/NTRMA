/**
 * Haptic feedback utilities for Android
 */
export function vibrate(pattern = 'light') {
  if (!navigator.vibrate) return
  switch (pattern) {
    case 'light': navigator.vibrate(10); break
    case 'medium': navigator.vibrate(25); break
    case 'heavy': navigator.vibrate(50); break
    case 'success': navigator.vibrate([10, 50, 10]); break
    case 'error': navigator.vibrate([30, 50, 30, 50, 30]); break
    default: navigator.vibrate(10)
  }
}
