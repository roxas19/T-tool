import React, { useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import CustomToolbar from "./CustomToolbar";
import PageNavigation from "./PageNavigation";
import MainToolbar from "./MainToolbar";
import WebcamDisplay from "./WebcamDisplay";
import PDFViewer from "./PDFViewer";
import DiagramSidebar from "./DiagramSidebar";
import VideoPlayer from "./VideoPlayer";
import "./App.css";
import { usePageNavigation } from "./hooks/usePageNavigation";
import { usePDFHandler } from "./hooks/usePDFHandler";
import { useWebcamManager } from "./hooks/useWebcamManager";

type ExcalidrawElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  [key: string]: any;
};

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
  const {
    pdfFile,
    isPdfScrollMode,
    pdfCurrentPage,
    pdfTotalPages,
    setPdfCurrentPage,
    setPdfTotalPages,
    handlePdfUpload,
    handlePdfClose,
    enablePdfScrollMode,
    disablePdfScrollMode,
  } = usePDFHandler();
  const {
    webcamOn,
    isStreamMode,
    isWebcamOverlayVisible,
    setIsStreamMode,
    toggleWebcam,
    setWebcamOn,
    setWebcamOverlayVisible,
  } = useWebcamManager();

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
  const [draggedDiagramElements, setDraggedDiagramElements] = useState<
    ExcalidrawElement[] | null
  >(null);

  const toggleVideoPlayer = () => {
    setIsVideoPlayerVisible((prev) => !prev);
    console.log("VideoPlayer visibility toggled:", !isVideoPlayerVisible);
  };

  const handleCanvasDrop = (event: React.DragEvent) => {
    if (!excalidrawAPI || !draggedDiagramElements) return;

    event.preventDefault();

    const { clientX, clientY } = event;
    const canvas = event.target as HTMLElement;
    const { left, top } = canvas.getBoundingClientRect();
    const dropX = clientX - left;
    const dropY = clientY - top;

    const positionedElements = draggedDiagramElements.map((element) => ({
      ...element,
      x: element.x + dropX,
      y: element.y + dropY,
    }));

    excalidrawAPI.updateScene({
      elements: [...excalidrawAPI.getSceneElements(), ...positionedElements],
    });

    console.log("Elements placed on canvas:", positionedElements);
    setDraggedDiagramElements(null); // Clear dragged elements after drop
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // Allow dropping
  };

  const handleDiagramDragStart = (elements: ExcalidrawElement[]) => {
    console.log("Diagram drag started:", elements);
    setDraggedDiagramElements(elements); // Cache elements being dragged
  };

  const handleWebcamClose = () => {
    if (isStreamMode) {
      setIsStreamMode(false);
      if (webcamOn) {
        setWebcamOverlayVisible(true);
      }
    } else {
      setWebcamOn(false);
      setWebcamOverlayVisible(false);
    }
  };

  return (
    <div
      style={{ height: "100vh", position: "relative", overflow: "hidden" }}
      onDrop={handleCanvasDrop}
      onDragOver={handleDragOver}
    >
      <WebcamDisplay
        onClose={handleWebcamClose}
        fullscreen={isStreamMode}
        webcamOn={webcamOn}
        isWebcamOverlayVisible={isWebcamOverlayVisible}
        setWebcamOverlayVisible={setWebcamOverlayVisible}
      />

      <PDFViewer
        pdfFile={pdfFile}
        currentPage={pdfCurrentPage}
        setTotalPages={setPdfTotalPages}
        isPdfScrollMode={isPdfScrollMode}
        enablePdfScrollMode={enablePdfScrollMode}
        disablePdfScrollMode={disablePdfScrollMode}
        handlePdfClose={handlePdfClose}
      />

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
          setWebcamOn={setWebcamOn}
          webcamOn={webcamOn}
          onToggleVideoPlayer={toggleVideoPlayer}
        />
        <CustomToolbar
          excalidrawAPI={excalidrawAPI}
          onToolSelect={(toolType: string) => setSelectedTool(toolType)}
        />

        <PageNavigation
          savePage={savePage}
          loadPage={loadPage}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setPdfCurrentPage(page);
            setCurrentPage(page);
          }}
          overlayVisible={!!pdfFile}
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

      {isVideoPlayerVisible && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "50px",
            zIndex: 100,
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <VideoPlayer />
        </div>
      )}

      <DiagramSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onDragStart={handleDiagramDragStart} // Pass callback for drag start
      />
    </div>
  );
}

export default TutorTool;
