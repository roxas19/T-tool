// src/pdfviewer/PdfContent.tsx

import React, { useRef, useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { useOverlayManager } from "../context/OverlayManagerContext";

interface PdfContentProps {
  src: string;
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
  zoomLevel: number;
  renderPage: (pageNum: number, canvas: HTMLCanvasElement, scale: number) => void;
}

const PdfContent: React.FC<PdfContentProps> = ({
  src,
  pdfDoc,
  currentPage,
  zoomLevel,
  renderPage,
}) => {
  // Create refs for the canvas element and its container.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract displayMode from the Overlay Manager context.
  const { overlayState } = useOverlayManager();
  const displayMode = overlayState.displayMode;
  const overlayZIndices = overlayState.overlayZIndices;

  // Re-render the page when the PDF document, current page, or zoom level changes.
  useEffect(() => {
    if (canvasRef.current && pdfDoc && containerRef.current) {
      // Measure container dimensions
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      // Get the PDF page to compute its intrinsic dimensions.
      pdfDoc.getPage(currentPage).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        // Calculate a base scale that fits the page inside the container.
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const baseScale = Math.min(scaleX, scaleY);
        // Multiply by user-controlled zoom level.
        const effectiveScale = baseScale * zoomLevel;
        // Render the page with the computed effective scale.
        renderPage(currentPage, canvasRef.current!, effectiveScale);
      }).catch((error) => {
        console.error("Error computing page scale", error);
      });
    }
  }, [pdfDoc, currentPage, zoomLevel, renderPage]);

  return (
    <div
      ref={containerRef}
      className={`pdf-content-layer ${displayMode === "draw" ? "pointer-none" : ""}`}
      style={{ zIndex: overlayZIndices.background, width: "100%", height: "100%" }}
    >
      <div className="pdf-main-area">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  );
};

export default PdfContent;
