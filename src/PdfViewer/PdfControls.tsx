// src/pdfviewer/PdfControls.tsx
import React from "react";
import InteractiveButton from "../utils/InteractiveButton";
import { useOverlayManager } from "../context/OverlayManagerContext";

interface PdfControlsProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
}

const PdfControls: React.FC<PdfControlsProps> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onClose,
  zoomLevel,
  onZoomChange,
}) => {
  // Extract display mode and dispatch from the Overlay Manager context.
  const { overlayState, overlayDispatch } = useOverlayManager();
  const displayMode = overlayState.displayMode;
  const overlayZIndices = overlayState.overlayZIndices;

  // Compute a slider value from the zoom level (multiplying by 50 for a percentage-style display).
  const sliderValue = Math.round(zoomLevel * 50);

  // Handler to update the zoom level.
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    onZoomChange(newVal / 50);
  };

  // Toggle between "draw" and "regular" display modes by dispatching an action.
  const handleDrawToggle = () => {
    overlayDispatch({
      type: "SET_DISPLAY_MODE",
      payload: displayMode === "draw" ? "regular" : "draw",
    });
  };

  return (
    <div className="pdf-controls-layer" style={{ zIndex: overlayZIndices.controls }}>
      <div className="pdf-controls-left-box">
        <InteractiveButton onClick={onPrev} disabled={currentPage <= 1}>
          Previous
        </InteractiveButton>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <InteractiveButton onClick={onNext} disabled={currentPage >= totalPages}>
          Next
        </InteractiveButton>
      </div>
      <div className="pdf-controls-right-box">
        <div className="zoom-area">
          <span className="zoom-value">{sliderValue}%</span>
          <input
            type="range"
            className="zoom-range"
            min="10"
            max="100"
            step="10"
            value={sliderValue}
            onChange={handleSliderChange}
          />
          <span className="zoom-label">Zoom</span>
        </div>
        <InteractiveButton onClick={handleDrawToggle} className="draw-btn">
          {displayMode === "draw" ? "Exit Draw" : "Draw"}
        </InteractiveButton>
        <InteractiveButton onClick={onClose} className="exit-btn">
          Exit PDF Viewer
        </InteractiveButton>
      </div>
    </div>
  );
};

export default PdfControls;
