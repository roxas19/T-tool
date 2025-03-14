// src/pdfviewer/usePdf.ts

import { useState, useEffect, useCallback, useRef } from "react";
import * as PDFJS from "pdfjs-dist";
import type { PDFDocumentProxy, RenderParameters } from "pdfjs-dist/types/src/display/api";

// Configure the PDF worker. (This is required for PDFJS to work properly.)
PDFJS.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

export const usePdf = (src: string) => {
  // State to hold the loaded PDF document.
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  // State to track the current page number.
  const [currentPage, setCurrentPage] = useState(1);
  // State for zoom level (kept for user adjustments; will be combined with auto-fit scale elsewhere).
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Ref to store the current render task so we can cancel it if needed.
  const renderTaskRef = useRef<PDFJS.RenderTask | null>(null);
  // Ref to track the latest page number we intend to render.
  const latestPageRef = useRef(currentPage);
  // Ref to ensure that our effects do not run on unmounted components.
  const isMountedRef = useRef(true);

  // Effect: Load the PDF document when the source URL changes.
  useEffect(() => {
    let cancelled = false;
    const loadingTask = PDFJS.getDocument({ url: src });
    loadingTask.promise.then(
      (loadedDoc) => {
        if (!cancelled) {
          setPdfDoc(loadedDoc);
          setCurrentPage(1); // Reset to first page on new document load.
        }
      },
      (error) => {
        if (!cancelled) console.error("Error loading PDF:", error);
      }
    );
    return () => {
      cancelled = true;
      loadingTask.destroy?.();
    };
  }, [src]);

  // Function to render a specific page on a given canvas using an effective scale.
  const renderPage = useCallback(
    (pageNum: number, canvas: HTMLCanvasElement, scale: number) => {
      if (!pdfDoc) return;
      // Save the latest page we want to render.
      latestPageRef.current = pageNum;
      // Get the canvas context.
      const context = canvas.getContext("2d");
      if (!context) {
        console.error("Canvas context is null!");
        return;
      }
      // Clear previous render.
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Get the page from the PDF document.
      pdfDoc.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale });
        // Resize the canvas to match the viewport dimensions.
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // Cancel any ongoing render task before starting a new one.
        renderTaskRef.current?.cancel();
        const renderContext: RenderParameters = {
          canvasContext: context,
          viewport,
        };
        // Start rendering the page.
        const task = page.render(renderContext);
        renderTaskRef.current = task;
        task.promise.then(
          () => {
            if (!isMountedRef.current) return;
            // If the page changed while rendering, discard this render.
            if (latestPageRef.current !== pageNum) {
              console.log("Discarding outdated render for page", pageNum);
              return;
            }
            console.log(`Page ${pageNum} rendered at effective scale ${scale}`);
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
    },
    [pdfDoc]
  );

  // Cleanup effect: Cancel render tasks when the component using the hook unmounts.
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      renderTaskRef.current?.cancel();
    };
  }, []);

  // Functions for navigating pages.
  const nextPage = () => {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return {
    pdfDoc,
    currentPage,
    zoomLevel,
    setZoomLevel,
    setCurrentPage,
    nextPage,
    prevPage,
    renderPage, // Updated to expect an extra "scale" parameter
  };
};
