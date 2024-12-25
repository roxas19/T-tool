import React, { useState, useRef, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import CustomToolbar from "./CustomToolbar";
import PageNavigation from "./PageNavigation";
import MainToolbar from "./MainToolbar";
import WebcamDisplay from "./WebcamDisplay";
import PDFViewer from "./PDFViewer";
import DiagramSidebar from "./DiagramSidebar";
import "./App.css";
import { usePageNavigation } from "./hooks/usePageNavigation";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

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
  onPointerDown: (
    callback: (
      activeTool: any,
      pointerDownState: any,
      event: React.PointerEvent<HTMLElement>
    ) => void
  ) => () => void;
  onPointerUp: (
    callback: (
      activeTool: any,
      pointerDownState: any,
      event: PointerEvent
    ) => void
  ) => () => void;
};

function TutorTool() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(
    null
  );
  const { savePage, loadPage, currentPage, setCurrentPage } =
    usePageNavigation(excalidrawAPI);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [webcamOn, setWebcamOn] = useState(false); // Determines if the webcam feed is active
  const [isStreamMode, setIsStreamMode] = useState(false); // Fullscreen Stream Mode
  const [isWebcamOverlayVisible, setWebcamOverlayVisible] = useState(false); // Overlay Mode

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isPdfScrollMode, setIsPdfScrollMode] = useState(false);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [diagramToPlace, setDiagramToPlace] = useState<any[] | null>(null);

  const lockedScroll = useRef<{ x: number; y: number } | null>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);

  const openConfigMenu = (toolType: string) => setSelectedTool(toolType);
  const closeConfigMenu = () => setSelectedTool(null);

  const toggleWebcam = () => {
    if (webcamOn) {
      setWebcamOn(false); // Stop the webcam feed
      setWebcamOverlayVisible(false); // Hide the overlay
    } else {
      setWebcamOn(true); // Start the webcam feed
      setWebcamOverlayVisible(true); // Show the overlay
    }
  };

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
    lockedScroll.current = null;
    setPdfCurrentPage(1);
  };

  const enablePdfScrollMode = () => setIsPdfScrollMode(true);
  const disablePdfScrollMode = () => setIsPdfScrollMode(false);

  const lockScroll = (x: number, y: number) => {
    excalidrawAPI?.updateScene(
      { appState: { scrollX: x, scrollY: y } },
      { commitToStore: false }
    );
  };

  const handleDiagramSelect = (elements: any[]) => {
    setDiagramToPlace(elements); // Store the diagram for placement
  };

  const handleCanvasDrop = (event: React.DragEvent) => {
    if (!diagramToPlace || !excalidrawAPI) return;

    event.preventDefault();

    const { clientX, clientY } = event;
    const canvas = event.target as HTMLElement;
    const { left, top } = canvas.getBoundingClientRect();
    const dropX = clientX - left;
    const dropY = clientY - top;

    const qualifiedElements = convertToExcalidrawElements(diagramToPlace).map(
      (element) => ({
        ...element,
        x: element.x + dropX,
        y: element.y + dropY,
      })
    );

    excalidrawAPI.updateScene({
      elements: [...excalidrawAPI.getSceneElements(), ...qualifiedElements],
    });

    setDiagramToPlace(null); // Clear the diagram after placement
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // Allow dropping
  };

  useEffect(() => {
    // Synchronize isWebcamOverlayVisible with webcamOn and isStreamMode
    if (!webcamOn) {
      setWebcamOverlayVisible(false); // If webcam is off, hide the overlay
    } else if (!isStreamMode) {
      setWebcamOverlayVisible(true); // If not in Stream Mode, show the overlay
    }
  }, [webcamOn, isStreamMode]);

  return (
    <div
      style={{ height: "100vh", position: "relative", overflow: "hidden" }}
      onDrop={handleCanvasDrop} // Handle drop event
      onDragOver={handleDragOver} // Allow dragging over canvas
    >
      {isStreamMode ? (
        <WebcamDisplay
          onClose={() => {
            setIsStreamMode(false); // Exit Stream Mode
            if (webcamOn) {
              setWebcamOverlayVisible(true); // Show the overlay if webcam is active
            }
          }}
          fullscreen={true}
        />
      ) : (
        <>
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
              <button
                onClick={isPdfScrollMode ? disablePdfScrollMode : enablePdfScrollMode}
              >
                {isPdfScrollMode ? "Back to Drawing" : "Scroll PDF"}
              </button>
              <button onClick={handlePdfClose}>Close PDF</button>
            </div>
          )}

          {webcamOn && isWebcamOverlayVisible && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 3,
              }}
            >
              <WebcamDisplay
                onClose={() => setWebcamOverlayVisible(false)} // Hides the small webcam overlay
                fullscreen={false}
              />
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
              onToggleWebcam={toggleWebcam}
              setIsStreamMode={setIsStreamMode}
              setWebcamOn={setWebcamOn} // Pass setter for webcamOn
              webcamOn={webcamOn} // Pass current webcam state
            />
            <CustomToolbar excalidrawAPI={excalidrawAPI} onToolSelect={openConfigMenu} />
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
              onChange={(elements, state) =>
                console.log("Canvas Updated", elements, state)
              }
              excalidrawAPI={(api) =>
                setExcalidrawAPI(api as unknown as CustomExcalidrawAPI)
              }
              initialData={{
                appState: { viewBackgroundColor: "transparent", gridSize: null },
              }}
            />
          </div>

          <DiagramSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onDiagramSelect={handleDiagramSelect}
          />
        </>
      )}
    </div>
  );
}

export default TutorTool;