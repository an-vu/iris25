import { useEffect, useRef } from "react";
import { showWebgazerVideo } from "../utils/webgazerVideo.js";

export function useWebgazerVideoMount(visible, mountId = "camera-float") {
  const videoMountRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    let rafId = null;
    const mountVideo = () => {
      const mountTarget = videoMountRef.current;
      if (!mountTarget) {
        rafId = requestAnimationFrame(mountVideo);
        return;
      }
      showWebgazerVideo(mountId, mountTarget);
    };
    mountVideo();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mountId, visible]);

  return videoMountRef;
}
