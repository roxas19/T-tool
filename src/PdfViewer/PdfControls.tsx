// PdfControls.tsx
import React, { useRef } from "react";
import { useOverlayManager } from "../context/OverlayManagerContext";
import { usePdfContext } from "../context/PdfContext";
import PrevIcon from "../icons/previous.svg";
import NextIcon from "../icons/next.svg";
import DrawIcon from "../icons/draw.svg";
import ControlPanel from "../utils/ControlPanel"; // Import our new component

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
  const { overlayState, overlayDispatch } = useOverlayManager();
  const displayMode = overlayState.displayMode;
  const overlayZIndices = overlayState.overlayZIndices;
  const { pdfDispatch } = usePdfContext();
  const changePdfInputRef = useRef<HTMLInputElement>(null);

  const discreteZoomValues = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const currentIndex = discreteZoomValues.findIndex((val) => val === zoomLevel);
  const sliderValue = currentIndex !== -1 ? currentIndex + 1 : 3;
  const displayZoomPercent = Math.round(zoomLevel * 100) + "%";

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = discreteZoomValues[Number(e.target.value) - 1] || 1.0;
    onZoomChange(newZoom);
  };

  const handleDrawToggle = () => {
    overlayDispatch({
      type: "SET_DISPLAY_MODE",
      payload: displayMode === "draw" ? "regular" : "draw",
    });
  };

  const handleChangePdfClick = () => changePdfInputRef.current?.click();

  const handleChangePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      pdfDispatch({ type: "OPEN_PDF_VIEWER", payload: fileUrl });
      e.target.value = "";
    }
  };

  return (
    <ControlPanel
      containerClassName="pdf-controls-layer"  // Use the existing CSS class from your PDF viewer styles.
      style={{ zIndex: overlayZIndices.controls }}
      leftContent={
        <>
          <button onClick={onPrev} disabled={currentPage <= 1} className="icon-button">
            <img src={PrevIcon} alt="Previous" />
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={onNext} disabled={currentPage >= totalPages} className="icon-button">
            <img src={NextIcon} alt="Next" />
          </button>
        </>
      }
      rightContent={
        <>
          <div className="zoom-area">
            <span className="zoom-value">{displayZoomPercent}</span>
            <input
              type="range"
              className="zoom-range"
              min="1"
              max="7"
              step="1"
              value={sliderValue}
              onChange={handleSliderChange}
            />
            <span className="zoom-label">Zoom</span>
          </div>
          <button
            onClick={handleDrawToggle}
            className={`icon-button draw-btn ${displayMode === "draw" ? "active" : ""}`}
            aria-pressed={displayMode === "draw"}
          >
            <img src={DrawIcon} alt={displayMode === "draw" ? "Exit Draw" : "Draw"} />
          </button>
          <button onClick={handleChangePdfClick} className="control-button ">
            Change PDF
          </button>
          <input
            ref={changePdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleChangePdf}
            style={{ display: "none" }}
          />
        </>
      }
    />
  );
};

export default PdfControls;
