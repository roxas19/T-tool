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
  // Retrieve the shared PDF state and functions using our custom hook.
  const { pdfDoc, currentPage, zoomLevel, nextPage, prevPage, setZoomLevel, renderPage } = usePdf(src);
  const { overlayZIndices } = useGlobalUI();

  return (
    <div className="pdf-viewer-container">
      {/* PdfContent receives the PDF document and render function to display the current page */}
      <PdfContent
        src={src}
        pdfDoc={pdfDoc}
        currentPage={currentPage}
        zoomLevel={zoomLevel}
        renderPage={renderPage}
      />
      {/* PdfControls handles navigation, zoom, and mode toggling */}
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
