// Whenever you flip the Iris toggle in the UI, this hook makes sure the app remembers it.
// Think of it as the single source of truth for “Iris is on/off.”

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "iris-eye-tracking-enabled";
const TOGGLE_EVENT = "iris-eye-tracking-toggle";

// Always boot the app with Iris disabled, regardless of any prior session state.
const getInitialValue = () => false;

/**
 * Keeps the Iris on/off preference in sync across components, tabs, and reloads.
 * Returns a tuple like useState: [enabled, setEnabled].
 */
export function useIrisToggle() {
  const [enabled, setEnabled] = useState(getInitialValue);

  // Listen for toggle events dispatched by other hook instances/tabs.
  useEffect(() => {
    const handler = (event) => {
      if (typeof event.detail === "boolean") {
        setEnabled(event.detail);
      }
    };
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

  // Updates state, persists to localStorage, and broadcasts to other listeners.
  const update = useCallback((next) => {
    const value = Boolean(next);
    setEnabled(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(value));
      window.dispatchEvent(new CustomEvent(TOGGLE_EVENT, { detail: value }));
    }
  }, []);

  return [enabled, update];
}

/**
 * Convenience hook for read-only consumers that just need the current flag.
 */
export function useEyeTrackingEnabled() {
  const [enabled] = useIrisToggle();
  return enabled;
}
