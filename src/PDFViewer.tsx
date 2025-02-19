import React, { useCallback, useEffect, useRef, useState } from "react";
import * as PDFJS from "pdfjs-dist";
import type {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";
import "./css/PDFViewer.css";

// Set up the PDF worker
PDFJS.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  src: string;
  onClose: () => void; // Callback to exit PDF mode
}

const PdfViewer: React.FC<PdfViewerProps> = ({ src, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Container for the PDF content (scrollable area)
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0); // 50% -> 1.0x scale

  const renderTaskRef = useRef<PDFJS.RenderTask | null>(null);
  const isMountedRef = useRef(true);
  const latestPageRef = useRef(currentPage);

  // Disable native pinch-to-zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent pinch-zoom if ctrlKey is pressed
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      renderTaskRef.current?.cancel();
    };
  }, []);

  // Render the requested page
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

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Get the PDF page
        pdf.getPage(pageNum)
          .then((page) => {
            // Create viewport at current zoom
            const viewport = page.getViewport({ scale: zoomLevel });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const updatedContext = canvas.getContext("2d");
            if (!updatedContext) {
              console.error("Canvas context is null after resizing!");
              return;
            }

            // Cancel any previous render task
            renderTaskRef.current?.cancel();

            // Render the page
            const renderContext: RenderParameters = {
              canvasContext: updatedContext,
              viewport,
            };
            const newRenderTask = page.render(renderContext);
            renderTaskRef.current = newRenderTask;

            // Handle the render completion
            newRenderTask.promise.then(
              () => {
                if (!isMountedRef.current) return;
                if (latestPageRef.current !== pageNum) {
                  console.log("Discarding outdated render for page", pageNum);
                  return;
                }
                console.log(
                  `Page ${pageNum} rendered successfully at zoom level ${zoomLevel}`
                );
              },
              (error) => {
                if (
                  error &&
                  error.name === "RenderingCancelledException"
                ) {
                  console.log("Rendering cancelled for page", pageNum);
                } else {
                  console.error(
                    "Error during rendering page",
                    pageNum,
                    error
                  );
                }
              }
            );
          })
          .catch((error) => {
            console.error("Error getting page", pageNum, error);
          });
      });
    },
    [pdfDoc, zoomLevel]
  );

  // Load PDF on src change
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
      // Cancel the loading if needed
      loadingTask.destroy?.();
    };
  }, [src]);

  // Re-render page on page/zoom change
  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, zoomLevel, renderPage]);

  // Navigation
  const nextPage = () => {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
      setCurrentPage(currentPage + 1);
    } else {
      console.log("Next page unavailable");
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      console.log("Previous page unavailable");
    }
  };

  // Zoom
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = Number(e.target.value);
    setZoomLevel(newPercent / 50);
  };

  return (
    <div className="pdf-viewer-reorg1">
      {/* 
        1) Top row with three sections: 
           - left box for PDF controls (prev/next/page info)
           - center gap for main toolbar 
           - right box for exit button 
      */}
      <div className="pdf-top-row">
        <div className="pdf-controls-left-box">
          <button onClick={prevPage} disabled={currentPage <= 1}>
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {pdfDoc?.numPages ?? "?"}
          </span>
          <button
            onClick={nextPage}
            disabled={pdfDoc ? currentPage >= pdfDoc.numPages : true}
          >
            Next
          </button>
        </div>

        <div className="pdf-top-center-box">
          {/* 
            Placeholder for the main toolbar area 
            (left intentionally empty if your main app toolbar 
            is a separate component) 
          */}
        </div>

        <div className="pdf-controls-right-box">
          <button onClick={onClose} className="exit-btn">
            Exit PDF Viewer
          </button>
        </div>
      </div>

      {/* 2) Main space for the PDF canvas (scrollable if needed) */}
      <div className="pdf-main-area" ref={containerRef}>
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>

      {/* 
        3) Bottom-right small rectangle for the zoom slider 
        (fixed position or anchored in its own row, depending on your preference)
      */}
      <div className="pdf-zoom-area">
        <div className="zoom-value">{Math.round(zoomLevel * 50)}%</div>
        <input
          type="range"
          className="zoom-range"
          min="10"
          max="100"
          step="10"
          value={Math.round(zoomLevel * 50)}
          onChange={handleZoomChange}
        />
        <div className="zoom-label">Zoom</div>
      </div>
    </div>
  );
};

export default PdfViewer;
