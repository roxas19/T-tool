import React, { useEffect, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set the worker source path, assuming you have pdf.worker.min.mjs in the public folder
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

type PDFViewerProps = {
  pdfFile: File | null; // Null if no file is loaded
  currentPage: number; // Assumes 1-based indexing
  setTotalPages: (totalPages: number) => void;
  isPdfScrollMode: boolean;
  enablePdfScrollMode: () => void;
  disablePdfScrollMode: () => void;
  handlePdfClose: () => void;
};

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfFile,
  currentPage,
  setTotalPages,
  isPdfScrollMode,
  enablePdfScrollMode,
  disablePdfScrollMode,
  handlePdfClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to send the current page data to the backend
  const sendPageToBackend = async (blob: Blob | null, pageNumber: number) => {
    if (!blob) {
      console.error("No blob data available to send");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("page", blob, `page-${pageNumber}.png`);
      formData.append("pageNumber", pageNumber.toString());

      // Mock endpoint for testing
      const response = await fetch(
        "http://localhost:8000/api/upload-pdf-page/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send page data: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Page data sent successfully:", result);
    } catch (error) {
      console.error("Error sending page data to backend:", error);
    }
  };

  useEffect(() => {
    if (!pdfFile) return;

    let renderTask: any; // To keep track of the current render task

    const loadPDFPage = async () => {
      try {
        const pdf = await getDocument(URL.createObjectURL(pdfFile)).promise;

        // Set total pages in the parent component
        setTotalPages(pdf.numPages);

        console.log(`Loading PDF page: ${currentPage}`); // Debugging log

        const page = await pdf.getPage(currentPage); // 1-based indexing
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          // Cancel any ongoing render before starting a new one
          if (renderTask) {
            renderTask.cancel();
          }

          // Start a new render task
          renderTask = page.render({ canvasContext: context, viewport });
          await renderTask.promise;

          // Extract the canvas content as a Blob and send it to the backend
          canvas.toBlob((blob) => {
            sendPageToBackend(blob, currentPage);
          });
        }
      } catch (error) {
        console.error("Error loading or rendering PDF page:", error);
      }
    };

    loadPDFPage();

    return () => {
      // Cleanup: Cancel the render task if the component unmounts
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfFile, currentPage, setTotalPages]);

  if (!pdfFile) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        overflow: isPdfScrollMode ? "auto" : "hidden",
      }}
    >
      {/* PDF Rendering */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Overlay Controls */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 3,
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={isPdfScrollMode ? disablePdfScrollMode : enablePdfScrollMode}
        >
          {isPdfScrollMode ? "Back to Drawing" : "Scroll PDF"}
        </button>
        <button onClick={handlePdfClose}>Close PDF</button>
      </div>
    </div>
  );
};

export default PDFViewer;
