import React, { useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import CustomToolbar from "./CustomToolbar";
import PageNavigation from "./PageNavigation";
import MainToolbar from "./MainToolbar";
import WebcamDisplay from "./WebcamDisplay";
import PDFViewer from "./PDFViewer";
import DiagramSidebar from "./DiagramSidebar";
import "./App.css";
import { usePageNavigation } from "./hooks/usePageNavigation";
import { usePDFHandler } from "./hooks/usePDFHandler";
import { useWebcamManager } from "./hooks/useWebcamManager";
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
  const [diagramToPlace, setDiagramToPlace] = useState<any[] | null>(null);

  const handleDiagramSelect = (elements: any[]) => {
    setDiagramToPlace(elements);
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

    setDiagramToPlace(null);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleWebcamClose = () => {
    if (isStreamMode) {
      // Exit fullscreen and show the overlay if webcam is on
      setIsStreamMode(false);
      if (webcamOn) {
        setWebcamOverlayVisible(true);
      }
    } else {
      // Turn off the webcam and hide the overlay
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

      <DiagramSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onDiagramSelect={handleDiagramSelect}
      />
    </div>
  );
}

export default TutorTool;
