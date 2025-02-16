import React, { useCallback, useEffect, useRef, useState } from "react";
import * as PDFJS from "pdfjs-dist";
import type { PDFDocumentProxy, RenderParameters } from "pdfjs-dist/types/src/display/api";
import "./css/PDFViewer.css";

// Set up the PDF worker
PDFJS.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  src: string;
  onClose: () => void; // Callback to exit PDF mode
}

const PdfViewer: React.FC<PdfViewerProps> = ({ src, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Zoom level state as a scale factor. Now the slider maps such that 50 = 1.0x
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Use a ref for the render task instead of state
  const renderTaskRef = useRef<PDFJS.RenderTask | null>(null);
  // Track if the component is still mounted
  const isMountedRef = useRef(true);
  // Track the latest page requested to avoid race conditions
  const latestPageRef = useRef(currentPage);

  // Disable native pinch-to-zoom on this container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      // Many browsers signal pinch/ctrl+wheel by setting ctrlKey true.
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, []);

  const renderPage = useCallback(
    (pageNum: number, pdf = pdfDoc) => {
      if (!canvasRef.current) {
        console.error("Canvas not found!");
        return;
      }
      if (!pdf) {
        console.error("PDF document not available!");
        return;
      }
      latestPageRef.current = pageNum;
      window.requestAnimationFrame(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");
        if (!context) {
          console.error("Canvas context is null!");
          return;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        pdf.getPage(pageNum).then((page) => {
          const viewport = page.getViewport({ scale: zoomLevel });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const updatedContext = canvas.getContext("2d");
          if (!updatedContext) {
            console.error("Canvas context is null after resizing!");
            return;
          }
          const renderContext: RenderParameters = {
            canvasContext: updatedContext,
            viewport: viewport,
          };
          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }
          const newRenderTask = page.render(renderContext);
          renderTaskRef.current = newRenderTask;
          newRenderTask.promise.then(
            () => {
              if (!isMountedRef.current) return;
              if (latestPageRef.current !== pageNum) {
                console.log("Discarding outdated render for page", pageNum);
                return;
              }
              console.log("Page", pageNum, "rendered successfully at zoom level", zoomLevel);
            },
            (error) => {
              if (error && error.name === "RenderingCancelledException") {
                console.log("Rendering cancelled for page", pageNum);
              } else {
                console.error("Error during rendering page", pageNum, error);
              }
            }
          );
        }).catch((error) => {
          console.error("Error getting page", pageNum, error);
        });
      });
    },
    [pdfDoc, zoomLevel]
  );

  useEffect(() => {
    let cancelled = false;
    console.log("Loading PDF from src:", src);
    const loadingTask = PDFJS.getDocument({ url: src });
    loadingTask.promise.then(
      (loadedDoc) => {
        if (cancelled) return;
        console.log("PDF loaded successfully:", loadedDoc);
        setPdfDoc(loadedDoc);
        setCurrentPage(1);
      },
      (error) => {
        if (cancelled) return;
        console.error("Error loading PDF:", error);
      }
    );
    return () => {
      cancelled = true;
      loadingTask.destroy?.();
    };
  }, [src]);

  // Re-render page when zoom level changes
  useEffect(() => {
    if (pdfDoc) {
      console.log("Re-rendering page", currentPage, "at zoom level", zoomLevel);
      renderPage(currentPage);
    }
  }, [zoomLevel, pdfDoc, currentPage, renderPage]);

  useEffect(() => {
    if (pdfDoc) {
      console.log("Rendering page", currentPage, "of PDF with", pdfDoc.numPages, "pages");
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage]);

  const nextPage = () => {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
      console.log("Moving to next page:", currentPage + 1);
      setCurrentPage(currentPage + 1);
    } else {
      console.log("Next page unavailable");
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      console.log("Moving to previous page:", currentPage - 1);
      setCurrentPage(currentPage - 1);
    } else {
      console.log("Previous page unavailable");
    }
  };

  // Handler for the zoom slider (value in percent, from 10 to 100).
  // Here, a value of 50 => 50/50 = 1.0 scale, and a value of 80 => 80/50 = 1.6 scale.
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = Number(e.target.value);
    setZoomLevel(newPercent / 50);
  };

  return (
    <div className="pdf-viewer-container">
      {/* Navigation and zoom controls */}
      <div className="pdf-controls">
        <button onClick={prevPage} disabled={currentPage <= 1}>
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {pdfDoc?.numPages ?? "?"}
        </span>
        <button onClick={nextPage} disabled={pdfDoc ? currentPage >= pdfDoc.numPages : true}>
          Next
        </button>
        {/* Zoom slider (10 to 100, steps of 10) */}
        <label className="zoom-label">
          Zoom:
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={Math.round(zoomLevel * 50)}
            onChange={handleZoomChange}
          />
          <span>{Math.round(zoomLevel * 50)}%</span>
        </label>
        <button onClick={onClose} className="exit-btn">
          Exit PDF Viewer
        </button>
      </div>
      {/* Scrollable canvas container */}
      <div className="pdf-canvas-container" ref={containerRef}>
        <canvas ref={canvasRef} className="pdf-canvas"></canvas>
      </div>
    </div>
  );
};

export default PdfViewer;
