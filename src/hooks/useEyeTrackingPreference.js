import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "iris-eye-tracking-enabled";
const TOGGLE_EVENT = "iris-eye-tracking-toggle";

const getInitialValue = () => {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "true";
};

export function useEyeTrackingPreference() {
  const [enabled, setEnabled] = useState(getInitialValue);

  useEffect(() => {
    const handler = (event) => {
      if (typeof event.detail === "boolean") {
        setEnabled(event.detail);
      }
    };
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

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

export function useEyeTrackingEnabled() {
  const [enabled] = useEyeTrackingPreference();
  return enabled;
}
