// Accessibility utilities

export class Accessibility {
  static reducedMotion: boolean = false;
  static highContrast: boolean = false;
  static screenReaderAnnouncer: HTMLElement | null = null;

  static init(): void {
    if (typeof window === 'undefined') return;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.highContrast = window.matchMedia('(prefers-contrast: more)').matches;

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      document.documentElement.classList.toggle('reduced-motion', e.matches);
    });

    window.matchMedia('(prefers-contrast: more)').addEventListener('change', (e) => {
      this.highContrast = e.matches;
      document.documentElement.classList.toggle('high-contrast', e.matches);
    });

    document.documentElement.classList.toggle('reduced-motion', this.reducedMotion);
    document.documentElement.classList.toggle('high-contrast', this.highContrast);

    // Create live region for screen readers
    this.screenReaderAnnouncer = document.createElement('div');
    this.screenReaderAnnouncer.setAttribute('role', 'status');
    this.screenReaderAnnouncer.setAttribute('aria-live', 'polite');
    this.screenReaderAnnouncer.setAttribute('aria-atomic', 'true');
    this.screenReaderAnnouncer.style.position = 'absolute';
    this.screenReaderAnnouncer.style.left = '-9999px';
    this.screenReaderAnnouncer.style.width = '1px';
    this.screenReaderAnnouncer.style.height = '1px';
    this.screenReaderAnnouncer.style.overflow = 'hidden';
    document.body.appendChild(this.screenReaderAnnouncer);
  }

  static announce(message: string): void {
    if (this.screenReaderAnnouncer) {
      this.screenReaderAnnouncer.textContent = '';
      // Force reflow for repeated announcements
      this.screenReaderAnnouncer.offsetHeight;
      this.screenReaderAnnouncer.textContent = message;
    }
  }

  static shouldReduceMotion(): boolean {
    return this.reducedMotion;
  }

  static shouldHighContrast(): boolean {
    return this.highContrast;
  }

  // Get animation duration respecting reduced motion
  static getDuration(normal: number): number {
    return this.reducedMotion ? 0 : normal;
  }

  // Get transition duration respecting reduced motion
  static getTransition(normal: number): number {
    return this.reducedMotion ? 0.01 : normal;
  }
}

// Initialize on import
Accessibility.init();

export const accessibility = Accessibility;