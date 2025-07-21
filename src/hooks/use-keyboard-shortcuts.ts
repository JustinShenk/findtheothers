import { useEffect } from 'react';

interface KeyboardShortcuts {
  onToggleControls?: () => void;
  onResetCamera?: () => void;
  onToggleForces?: () => void;
  onSwitchToPCA?: () => void;
  onSwitchToForce?: () => void;
  onSwitchToClusters?: () => void;
}

export function useKeyboardShortcuts({
  onToggleControls,
  onResetCamera,
  onToggleForces,
  onSwitchToPCA,
  onSwitchToForce,
  onSwitchToClusters,
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'c':
          onToggleControls?.();
          break;
        case 'r':
          onResetCamera?.();
          break;
        case 'f':
          onToggleForces?.();
          break;
        case '1':
          onSwitchToPCA?.();
          break;
        case '2':
          onSwitchToForce?.();
          break;
        case '3':
          onSwitchToClusters?.();
          break;
        case 'Escape':
          // Close any open panels
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToggleControls, onResetCamera, onToggleForces, onSwitchToPCA, onSwitchToForce, onSwitchToClusters]);
}