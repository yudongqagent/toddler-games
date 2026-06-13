// Haptic feedback utility for mobile devices

export class Haptics {
  static supported: boolean = 'vibrate' in navigator;

  static light(): void {
    if (this.supported) {
      navigator.vibrate(10);
    }
  }

  static medium(): void {
    if (this.supported) {
      navigator.vibrate(20);
    }
  }

  static heavy(): void {
    if (this.supported) {
      navigator.vibrate([10, 30, 10]);
    }
  }

  static success(): void {
    if (this.supported) {
      navigator.vibrate([10, 50, 10, 50, 10]);
    }
  }

  static error(): void {
    if (this.supported) {
      navigator.vibrate([50, 50, 50]);
    }
  }

  static selection(): void {
    if (this.supported) {
      navigator.vibrate(5);
    }
  }
}

export const haptics = Haptics;