// src/pdfviewer/PdfContent.tsx

import React, { useRef, useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { useGlobalUI } from "../context/GlobalUIContext";

interface PdfContentProps {
  src: string;
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
  zoomLevel: number;
  renderPage: (pageNum: number, canvas: HTMLCanvasElement) => void;
}

const PdfContent: React.FC<PdfContentProps> = ({ src, pdfDoc, currentPage, zoomLevel, renderPage }) => {
  // Create a ref for the canvas element where the PDF page will be rendered.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Access global UI state to check for display mode.
  const { displayMode } = useGlobalUI();

  // When the PDF document, current page, or zoom level changes,
  // re-render the page on the canvas.
  useEffect(() => {
    if (canvasRef.current && pdfDoc) {
      renderPage(currentPage, canvasRef.current);
    }
  }, [pdfDoc, currentPage, zoomLevel, renderPage]);

  return (
    <div className={`pdf-content-layer ${displayMode === "draw" ? "pointer-none" : ""}`}>
      <div className="pdf-main-area">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  );
};

export default PdfContent;
