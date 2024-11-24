import React, { useState, useRef, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import CustomToolbar from "./CustomToolbar";
import PageNavigation from "./PageNavigation";
import MainToolbar from "./MainToolbar";
import WebcamDisplay from "./WebcamDisplay";
import PDFViewer from "./PDFViewer";
import DiagramSidebar from "./DiagramSidebar";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";
import { usePageNavigation } from "./hooks/usePageNavigation";

type CustomExcalidrawAPI = {
  updateScene: (sceneData: any, opts?: { commitToStore?: boolean }) => void;
  getSceneElements: () => readonly any[];
  getAppState: () => any;
  exportToBlob: () => Promise<Blob>;
  resetScene: () => void;
  undo: () => void;
  redo: () => void;
  setActiveTool: (tool: any) => void;
  onChange: (callback: (elements: any[], appState: any) => void) => () => void;
  viewportCoordsToSceneCoords: (coords: { x: number; y: number }) => { x: number; y: number };
};

function TutorTool() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);
  const { savePage, loadPage, currentPage, setCurrentPage } = usePageNavigation(excalidrawAPI);
  const [webcamOn, setWebcamOn] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isPdfScrollMode, setIsPdfScrollMode] = useState(false);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pdfViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("App mounted. Initializing components...");
  }, []);

  const handlePdfUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        console.log("PDF file uploaded:", file);
        setPdfFile(file);
        setOverlayVisible(true);
      }
    };
    input.click();
  };

  const handlePdfClose = () => {
    console.log("Closing PDF overlay");
    setOverlayVisible(false);
    setPdfFile(null);
    setIsPdfScrollMode(false);
    setPdfCurrentPage(1);
  };

  const enablePdfScrollMode = () => {
    console.log("Enabling PDF scroll mode");
    setIsPdfScrollMode(true);
  };

  const disablePdfScrollMode = () => {
    console.log("Disabling PDF scroll mode");
    setIsPdfScrollMode(false);
  };

  const goToNextPage = () => {
    console.log("Navigating to next page");
    savePage();
    if (overlayVisible) {
      if (pdfCurrentPage < pdfTotalPages) {
        setPdfCurrentPage((prev) => prev + 1);
      }
    } else {
      setCurrentPage((prev) => prev + 1);
      loadPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    console.log("Navigating to previous page");
    savePage();
    if (overlayVisible) {
      if (pdfCurrentPage > 1) {
        setPdfCurrentPage((prev) => prev - 1);
      }
    } else if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      loadPage(currentPage - 1);
    }
  };

  const CanvasDropArea = () => {
    const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
      accept: "DIAGRAM",
      drop: (item: any) => {
        console.log("Drop function triggered with item:", item);
        if (!excalidrawAPI) {
          console.error("Excalidraw API is not available.");
          return;
        }

        const sceneCoords = excalidrawAPI.viewportCoordsToSceneCoords({
          x: 300, // Adjust based on your testing
          y: 200,
        });

        console.log("Drop coordinates mapped to scene:", sceneCoords);

        const newElement = {
          id: `diagram-${Math.random().toString(36).substring(7)}`,
          type: "image",
          x: sceneCoords.x,
          y: sceneCoords.y,
          width: 300,
          height: 200,
          data: item.svg,
        };

        console.log("Adding new element to scene:", newElement);

        excalidrawAPI.updateScene({
          elements: [...excalidrawAPI.getSceneElements(), newElement],
        });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));

    useEffect(() => {
      console.log("CanvasDropArea mounted. Drop event readiness check:");
      console.log("isOver:", isOver, "canDrop:", canDrop);
    }, [isOver, canDrop]);

    return (
      <div
        ref={dropRef}
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          backgroundColor: isOver ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.1)", // Default red, green when active
          border: "2px dashed red",
          zIndex: 9999, // Ensured topmost layer
          pointerEvents: "all",
        }}
      />
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
        {overlayVisible && pdfFile && (
          <div
            ref={pdfViewerRef}
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
            <PDFViewer
              pdfFile={pdfFile}
              currentPage={pdfCurrentPage}
              setTotalPages={setPdfTotalPages}
            />
          </div>
        )}

        {overlayVisible && (
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
            <button onClick={isPdfScrollMode ? disablePdfScrollMode : enablePdfScrollMode}>
              {isPdfScrollMode ? "Back to Drawing" : "Scroll PDF"}
            </button>
            <button onClick={handlePdfClose}>Close PDF</button>
          </div>
        )}

        {webcamOn && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 3,
            }}
          >
            <WebcamDisplay />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            pointerEvents: isPdfScrollMode ? "none" : "auto",
          }}
        >
          <MainToolbar
            excalidrawAPI={excalidrawAPI}
            onUploadPDF={handlePdfUpload}
            onToggleWebcam={() => setWebcamOn((prev) => !prev)}
          />
          <CustomToolbar excalidrawAPI={excalidrawAPI} onToolSelect={(tool) => console.log(`Tool selected: ${tool}`)} />
          <PageNavigation
            savePage={savePage}
            loadPage={loadPage}
            currentPage={currentPage}
            setCurrentPage={(page) => {
              setPdfCurrentPage(page);
              setCurrentPage(page);
            }}
            overlayVisible={overlayVisible}
            pdfTotalPages={pdfTotalPages}
          />

          <Excalidraw
            onChange={(elements, state) => {
              console.log("Canvas updated with", elements.length, "elements");
            }}
            excalidrawAPI={(api) => {
              console.log("Excalidraw API initialized:", api);
              setExcalidrawAPI(api as unknown as CustomExcalidrawAPI);
            }}
            initialData={{
              appState: { viewBackgroundColor: "transparent", gridSize: null },
            }}
          />

          <CanvasDropArea />
        </div>

        <DiagramSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </div>
    </DndProvider>
  );
}

export default TutorTool;
