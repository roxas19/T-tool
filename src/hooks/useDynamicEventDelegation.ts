import { useEffect, useState, RefObject } from "react";

type OverlayName = "sidebar" | "webcam" | "youtube";

const useDynamicEventDelegation = (
  refs: { [key in OverlayName]: RefObject<HTMLDivElement> }
) => {
  const [activeOverlay, setActiveOverlay] = useState<OverlayName | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const cursorX = event.clientX;
      const cursorY = event.clientY;

      // Check if the cursor is over any overlay
      const hoveredOverlay = (Object.keys(refs) as OverlayName[]).find((name) => {
        const ref = refs[name];
        if (ref?.current) {
          const rect = ref.current.getBoundingClientRect();
          return (
            cursorX >= rect.left &&
            cursorX <= rect.right &&
            cursorY >= rect.top &&
            cursorY <= rect.bottom
          );
        }
        return false;
      });

      setActiveOverlay(hoveredOverlay || null); // Update active overlay state
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [refs]);

  return activeOverlay;
};

export default useDynamicEventDelegation;
