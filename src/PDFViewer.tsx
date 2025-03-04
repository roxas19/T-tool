// src/pdfviewer/PdfViewer.tsx

import React from "react";
import PdfContent from "./PdfViewer/PdfContent";
import PdfControls from "./PdfViewer/PdfControls";
import { usePdf } from "./PdfViewer/usePdf";
import { useGlobalUI } from "./context/GlobalUIContext";
import "./css/PDFViewer.css";

interface PdfViewerProps {
  src: string;
  onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ src, onClose }) => {
  // Use the specialized hook to manage PDF state locally.
  const { pdfDoc, currentPage, zoomLevel, nextPage, prevPage, setZoomLevel, renderPage } = usePdf(src);
  // Get overlay z-indexes from global context.
  const { state } = useGlobalUI();
  const overlayZIndices = state.overlayZIndices;

  return (
    <div className="pdf-viewer-container">
      {/* PdfContent renders the PDF page */}
      <PdfContent
        src={src}
        pdfDoc={pdfDoc}
        currentPage={currentPage}
        zoomLevel={zoomLevel}
        renderPage={renderPage}
      />
      {/* PdfControls handles navigation and zoom */}
      <PdfControls
        currentPage={currentPage}
        totalPages={pdfDoc ? pdfDoc.numPages : 0}
        onPrev={prevPage}
        onNext={nextPage}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        onClose={onClose}
      />
    </div>
  );
};

export default PdfViewer;
