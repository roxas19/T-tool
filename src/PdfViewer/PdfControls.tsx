import React, { useRef } from "react";
import { useOverlayManager } from "../context/OverlayManagerContext";
import { usePdfContext } from "../context/PdfContext";

// Import SVG icons for PDF controls
import PrevIcon from "../icons/previous.svg";
import NextIcon from "../icons/next.svg";
import DrawIcon from "../icons/draw.svg";

interface PdfControlsProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void; // still used if needed elsewhere (e.g. a separate exit action)
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

  // Get PDF context dispatch for changing the PDF.
  const { pdfDispatch } = usePdfContext();

  // Create a ref for the hidden file input for changing PDFs.
  const changePdfInputRef = useRef<HTMLInputElement>(null);

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

  // Trigger file selection for changing the PDF.
  const handleChangePdfClick = () => {
    changePdfInputRef.current?.click();
  };

  // Handle new PDF file selection.
  const handleChangePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the new PDF and dispatch the OPEN_PDF_VIEWER action.
      const fileUrl = URL.createObjectURL(file);
      pdfDispatch({ type: "OPEN_PDF_VIEWER", payload: fileUrl });
      // Clear the input value so the same file can be re-uploaded if needed.
      e.target.value = "";
    }
  };

  return (
    <div className="pdf-controls-layer" style={{ zIndex: overlayZIndices.controls }}>
      <div className="pdf-controls-left-box">
        <button
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="pdf-control-btn icon-button"
        >
          <img src={PrevIcon} alt="Previous" />
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="pdf-control-btn icon-button"
        >
          <img src={NextIcon} alt="Next" />
        </button>
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
        <button onClick={handleDrawToggle} className="pdf-control-btn draw-btn">
          <img
            src={DrawIcon}
            alt={displayMode === "draw" ? "Exit Draw" : "Draw"}
          />
        </button>
        <button onClick={handleChangePdfClick} className="pdf-control-btn exit-btn">
          Change PDF
        </button>
        {/* Hidden file input for changing PDFs */}
        <input
          ref={changePdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleChangePdf}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default PdfControls;
