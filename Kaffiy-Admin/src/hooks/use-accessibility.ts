import { useEffect, useCallback } from 'react';

export const useAccessibility = () => {
  // Keyboard navigation support
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Escape key handling
    if (event.key === 'Escape') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement?.closest('[role="dialog"]')) {
        const closeButton = activeElement.querySelector('[data-dismiss="dialog"]') as HTMLElement;
        closeButton?.click();
      }
    }

    // Tab navigation trapping for modals
    if (event.key === 'Tab') {
      const activeModal = document.querySelector('[role="dialog"]');
      if (activeModal) {
        const focusableElements = activeModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            event.preventDefault();
          }
        }
      }
    }
  }, []);

  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Focus management
  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement?.focus();
  }, []);

  const restoreFocus = useCallback((previousElement: HTMLElement) => {
    previousElement?.focus();
  }, []);

  // High contrast mode detection
  const isHighContrastMode = useCallback(() => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }, []);

  // Reduced motion detection
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    announceToScreenReader,
    trapFocus,
    restoreFocus,
    isHighContrastMode,
    prefersReducedMotion,
  };
};
