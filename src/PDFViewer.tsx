// src/pdfviewer/PdfViewer.tsx
import React from "react";
import PdfContent from "./PdfViewer/PdfContent";
import PdfControls from "./PdfViewer/PdfControls";
import { usePdf } from "./PdfViewer/usePdf";
import "./css/PDFViewer.css";

interface PdfViewerProps {
  src: string;
  onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ src, onClose }) => {
  // Manage PDF state locally using the custom hook.
  const { pdfDoc, currentPage, zoomLevel, nextPage, prevPage, setZoomLevel, renderPage } = usePdf(src);



  // Apply the background z-index to the container.
  

  return (
    <div className="pdf-viewer-container" >
      {/* PdfContent renders the PDF page */}
      <PdfContent
        src={src}
        pdfDoc={pdfDoc}
        currentPage={currentPage}
        zoomLevel={zoomLevel}
        renderPage={renderPage}
      />
      {/* PdfControls handles navigation and zoom; you may also pass the controls z-index if needed */}
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
