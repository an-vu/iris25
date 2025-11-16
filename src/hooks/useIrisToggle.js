// Whenever you flip the Iris toggle in the UI, this hook makes sure the app remembers it.
// This is just a hook to store on/off flag in localStorage
// syncs it across components/tabs, and gives you [enabled, setEnabled].
// when this set to ON the first time, go to IrisManager.jsx for the logic/behavior when this button change to ON.
// So the hook handles persistence/sync of the flag,

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "iris-toggle-state"; // here’s the key storing toggle state
const TOGGLE_EVENT = "iris-toggle-update"; // here’s the event fired when it changes

// Always boot the app with Iris Toggle OFF
// Iris Toggle stays consistent across pages and reloads
const getInitialValue = () => {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return false;
  return stored === "true";
};

// Keeps the Iris on/off preference in sync across components, tabs, and reloads.
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
