// src/hooks/useSmallWebcamVisibility.ts
import { useMemo } from "react";
import { OverlayType } from "../context/OverlayManagerContext";

export const useSmallWebcamVisibility = (
  isToggledOn: boolean,
  activeStack: OverlayType[]
): boolean => {
  // If any high-priority overlay (meeting or realview) is active, hide the small webcam.
  const blocked = activeStack.includes("meeting") || activeStack.includes("realview");
  return isToggledOn && !blocked;
};
