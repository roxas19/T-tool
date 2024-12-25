import { useState, useRef } from "react";

export const usePDFHandler = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isPdfScrollMode, setIsPdfScrollMode] = useState(false);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const pdfViewerRef = useRef<HTMLDivElement>(null);

  const handlePdfUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        setPdfFile(file);
        setOverlayVisible(true);
      }
    };
    input.click();
  };

  const handlePdfClose = () => {
    setOverlayVisible(false);
    setPdfFile(null);
    setIsPdfScrollMode(false);
    setPdfCurrentPage(1);
  };

  const enablePdfScrollMode = () => setIsPdfScrollMode(true);
  const disablePdfScrollMode = () => setIsPdfScrollMode(false);

  return {
    pdfFile,
    overlayVisible,
    isPdfScrollMode,
    pdfCurrentPage,
    pdfTotalPages,
    setPdfCurrentPage,
    setPdfTotalPages,
    handlePdfUpload,
    handlePdfClose,
    enablePdfScrollMode,
    disablePdfScrollMode,
    pdfViewerRef,
  };
};
