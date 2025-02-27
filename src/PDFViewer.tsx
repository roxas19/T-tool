// PdfViewer.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as PDFJS from "pdfjs-dist";
import type {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";
import "./css/PDFViewer.css";
import InteractiveButton from "./utils/InteractiveButton";
import { useGlobalUI } from "./context/GlobalUIContext"; // For displayMode toggle

// Set up the PDF worker
PDFJS.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  src: string;
  onClose: () => void; // Callback to exit PDF mode
}

const PdfViewer: React.FC<PdfViewerProps> = ({ src, onClose }) => {
  // PDF state
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0); // 50% -> 1.0x scale

  // Refs for canvas and container
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<PDFJS.RenderTask | null>(null);
  const isMountedRef = useRef(true);
  const latestPageRef = useRef(currentPage);

  // Load PDF on src change
  useEffect(() => {
    let cancelled = false;
    const loadingTask = PDFJS.getDocument({ url: src });
    loadingTask.promise.then(
      (loadedDoc) => {
        if (cancelled) return;
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

  // Render the requested page
  const renderPage = useCallback(
    (pageNum: number, pdf = pdfDoc) => {
      if (!canvasRef.current || !pdf) {
        console.error("Canvas or PDF not available!");
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
        pdf.getPage(pageNum)
          .then((page) => {
            const viewport = page.getViewport({ scale: zoomLevel });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const updatedContext = canvas.getContext("2d");
            if (!updatedContext) {
              console.error("Canvas context is null after resizing!");
              return;
            }
            renderTaskRef.current?.cancel();
            const renderContext: RenderParameters = {
              canvasContext: updatedContext,
              viewport,
            };
            const newRenderTask = page.render(renderContext);
            renderTaskRef.current = newRenderTask;
            newRenderTask.promise.then(
              () => {
                if (!isMountedRef.current) return;
                if (latestPageRef.current !== pageNum) {
                  console.log("Discarding outdated render for page", pageNum);
                  return;
                }
                console.log(`Page ${pageNum} rendered at zoom level ${zoomLevel}`);
              },
              (error) => {
                if (error && error.name === "RenderingCancelledException") {
                  console.log("Rendering cancelled for page", pageNum);
                } else {
                  console.error("Error during rendering page", pageNum, error);
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

  // Re-render when pdfDoc, currentPage, or zoomLevel changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, zoomLevel, renderPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      renderTaskRef.current?.cancel();
    };
  }, []);

  // Navigation callbacks
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

  // Zoom callback
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
  };

  return (
    <div className="pdf-viewer-container">
      {/* PDF Content Component */}
      <PdfViewerContent containerRef={containerRef} canvasRef={canvasRef} />
      {/* PDF Controls Component (Rendered as a sibling) */}
      <PdfViewerControls
        currentPage={currentPage}
        totalPages={pdfDoc ? pdfDoc.numPages : 0}
        onPrev={prevPage}
        onNext={nextPage}
        onClose={() => {
          onClose();
          // When closing, reset zoom/page if needed
        }}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
      />
    </div>
  );
};

// ---------------------
// PdfViewerContent Component: Renders the PDF canvas
// ---------------------
interface PdfViewerContentProps {
  containerRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}
const PdfViewerContent: React.FC<PdfViewerContentProps> = ({ containerRef, canvasRef }) => {
  return (
    <div className="pdf-viewer-reorg1">
      <div className="pdf-main-area" ref={containerRef}>
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  );
};

// ---------------------
// PdfViewerControls Component: Renders interactive controls (including Draw Toggle)
// ---------------------
interface PdfViewerControlsProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
}
const PdfViewerControls: React.FC<PdfViewerControlsProps> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onClose,
  zoomLevel,
  onZoomChange,
}) => {
  const sliderValue = Math.round(zoomLevel * 50);
  // Use the global UI context to get displayMode toggle for the draw button
  const { displayMode, setDisplayMode } = useGlobalUI();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    onZoomChange(newVal / 50);
  };

  const handleDrawToggle = () => {
    setDisplayMode(displayMode === "draw" ? "regular" : "draw");
  };

  return (
    <div className="pdf-viewer-controls">
      <div className="pdf-controls-left-box">
        <InteractiveButton onClick={onPrev} style={{ minWidth: "80px" }} disabled={currentPage <= 1}>
          Previous
        </InteractiveButton>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <InteractiveButton onClick={onNext} style={{ minWidth: "80px" }} disabled={currentPage >= totalPages}>
          Next
        </InteractiveButton>
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
        {/* Draw Toggle Button */}
        <InteractiveButton onClick={handleDrawToggle} className="draw-btn">
          {displayMode === "draw" ? "Exit Draw" : "Draw"}
        </InteractiveButton>
        <InteractiveButton onClick={onClose} className="exit-btn">
          Exit PDF Viewer
        </InteractiveButton>
      </div>
    </div>
  );
};

export default PdfViewer;
