import React, { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set the worker source path, assuming you have pdf.worker.min.mjs in the public folder
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

type PDFViewerProps = {
  pdfFile: File | null; // Null if no file is loaded
  currentPage: number; // Assumes 1-based indexing
  setTotalPages: (totalPages: number) => void;
  handlePdfClose: () => void;
};

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfFile,
  currentPage,
  setTotalPages,
  handlePdfClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Introduce a zoom state; starting at 1.5 (can be adjusted)
  const [zoom, setZoom] = useState(1.5);

  // (Optional) Function to send the current page data to the backend.
  // You can remove or comment this out if not needed.
  const sendPageToBackend = async (blob: Blob | null, pageNumber: number) => {
    if (!blob) {
      console.error("No blob data available to send");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("page", blob, `page-${pageNumber}.png`);
      formData.append("pageNumber", pageNumber.toString());

      const response = await fetch("http://localhost:8000/api/upload-pdf-page/", {
        method: "POST",
        body: formData,
      });

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
    let renderTask: any;

    const loadPDFPage = async () => {
      try {
        // Create a PDF document from the uploaded file
        const pdf = await getDocument(URL.createObjectURL(pdfFile)).promise;
        // Set total pages in the parent component
        setTotalPages(pdf.numPages);

        // Load the current page (1-based indexing)
        const page = await pdf.getPage(currentPage);
        // Use the current zoom level in the viewport
        const viewport = page.getViewport({ scale: zoom });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");

        // Adjust canvas size to match the viewport dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          // Cancel any ongoing render before starting a new one
          if (renderTask) {
            renderTask.cancel();
          }
          // Render the PDF page onto the canvas
          renderTask = page.render({ canvasContext: context, viewport });
          await renderTask.promise;

          // Optionally, extract the canvas content as a Blob and send it to the backend
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
  }, [pdfFile, currentPage, setTotalPages, zoom]);

  if (!pdfFile) return null;

  // Zoom control handlers
  const handleZoomIn = () => {
    setZoom((prevZoom) => prevZoom + 0.25);
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => (prevZoom - 0.25 > 0.25 ? prevZoom - 0.25 : prevZoom));
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        overflow: "auto", // Allow scrolling when zoomed in
        backgroundColor: "#f0f0f0", // Optional background to distinguish the PDF layer
      }}
    >
      {/* PDF Rendering Area */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px", // Provides breathing room when zoomed out
        }}
      >
        <canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
      </div>

      {/* Overlay Controls (top-right) */}
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
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handlePdfClose}>Close PDF</button>
      </div>
    </div>
  );
};

export default PDFViewer;
