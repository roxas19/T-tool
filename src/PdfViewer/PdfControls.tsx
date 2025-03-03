// src/pdfviewer/PdfControls.tsx

import React from "react";
import InteractiveButton from "../utils/InteractiveButton";
import { useGlobalUI } from "../context/GlobalUIContext";

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
  // Access global UI state to get the current display mode and a setter for it.
  const { displayMode, setDisplayMode } = useGlobalUI();
  // Compute a slider value from the zoom level (multiplying by 50 for percentage-style display).
  const sliderValue = Math.round(zoomLevel * 50);

  // Handler to update zoom level based on the slider value.
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    onZoomChange(newVal / 50);
  };

  // Toggle between "draw" and "regular" display modes.
  const handleDrawToggle = () => {
    setDisplayMode(displayMode === "draw" ? "regular" : "draw");
  };

  return (
    <div className="pdf-controls-layer">
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
