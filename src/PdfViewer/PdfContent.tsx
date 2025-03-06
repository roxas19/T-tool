// src/pdfviewer/PdfContent.tsx

import React, { useRef, useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { useOverlayManager } from "../context/OverlayManagerContext";

interface PdfContentProps {
  src: string;
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
  zoomLevel: number;
  renderPage: (pageNum: number, canvas: HTMLCanvasElement) => void;
}

const PdfContent: React.FC<PdfContentProps> = ({
  src,
  pdfDoc,
  currentPage,
  zoomLevel,
  renderPage,
}) => {
  // Create a ref for the canvas element.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Extract displayMode from the Overlay Manager context.
  const { overlayState } = useOverlayManager();
  const displayMode = overlayState.displayMode;
  const overlayZIndices = overlayState.overlayZIndices;

  // Re-render the page when the PDF document, current page, or zoom level changes.
  useEffect(() => {
    if (canvasRef.current && pdfDoc) {
      renderPage(currentPage, canvasRef.current);
    }
  }, [pdfDoc, currentPage, zoomLevel, renderPage]);

  return (
    <div className={`pdf-content-layer ${displayMode === "draw" ? "pointer-none" : ""}`} style={{ zIndex: overlayZIndices.background }}>
      <div className="pdf-main-area">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  );
};

export default PdfContent;
