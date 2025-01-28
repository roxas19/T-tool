import React, { useState } from "react";
import { DailyProvider } from "@daily-co/daily-react";
import { getOrCreateCallObject } from "./dailyCall";

// Excalidraw + other custom imports
import { Excalidraw } from "@excalidraw/excalidraw";
import CustomToolbar from "./CustomToolbar";
import MainToolbar from "./MainToolbar";
import WebcamDisplay from "./WebcamDisplay";
import DiagramSidebar from "./DiagramSidebar";
import VideoPlayer from "./VideoPlayer";
import Recording from "./Recording";
import "./css/App.css";

// Hooks
import { usePageNavigation } from "./hooks/usePageNavigation";
import { useWebcamManager } from "./hooks/useWebcamManager";

// Meeting UI
import MeetingUI from "./MeetingUI";

// Typings for Excalidraw
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

// Begin our main App component
function App() {
  // Create a Daily call object once (memoized) to share with DailyProvider
  const callObject = getOrCreateCallObject();

  // Excalidraw and meeting states
  const [excalidrawAPI, setExcalidrawAPI] = useState<CustomExcalidrawAPI | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // Recording status
  const [playbackMode, setPlaybackMode] = useState<"youtube" | "local">("youtube"); // Default to YouTube mode
  
  // Page navigation & webcam logic
  const { savePage, loadPage, currentPage, setCurrentPage } = usePageNavigation(excalidrawAPI);
  const {
    webcamOn,
    isStreamMode,
    isWebcamOverlayVisible,
    setIsStreamMode,
    toggleWebcam,
    setWebcamOn,
    setWebcamOverlayVisible,
  } = useWebcamManager();

  // Room URL for Daily meeting
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  // Additional states
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
  const [draggedDiagramElements, setDraggedDiagramElements] = useState<ExcalidrawElement[] | null>(
    null
  );

  // Toggles
  const toggleRecording = () => setIsRecording((prev) => !prev);
  const toggleVideoPlayer = () => {
    setIsVideoPlayerVisible((prev) => !prev);
    console.log("VideoPlayer visibility toggled:", !isVideoPlayerVisible);
  };

  const handleDiagramDragStart = (elements: ExcalidrawElement[]) => {
    console.log("Diagram drag started:", elements);
    setDraggedDiagramElements(elements);
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
    setDraggedDiagramElements(null);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
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

  // Called when Daily meeting ends (from inside MeetingUI)
  const handleMeetingEnd = () => {
    console.log("Meeting ended.");
    setRoomUrl(null); // Clear the room URL
  };

  // Render
  return (
    // Wrap everything with DailyProvider, passing the same callObject
    <DailyProvider callObject={callObject}>
      <div
        style={{ height: "100vh", position: "relative", overflow: "hidden" }}
        onDrop={handleCanvasDrop}
        onDragOver={handleDragOver}
      >
        {/* Webcam Overlay */}
        <WebcamDisplay
          onClose={handleWebcamClose}
          fullscreen={isStreamMode}
          webcamOn={webcamOn}
          isWebcamOverlayVisible={isWebcamOverlayVisible}
          setWebcamOverlayVisible={setWebcamOverlayVisible}
          onToggleDrawingMode={(active) => setIsDrawingMode(active)}
          isDrawingMode={isDrawingMode}
        />

        {/* Meeting UI (Daily React-based) */}
        <MeetingUI roomUrl={roomUrl} onMeetingEnd={handleMeetingEnd} />

        {/* Only show toolbars if not in full stream mode OR if drawing */}
        {(!isStreamMode || isDrawingMode) && (
          <>
            <MainToolbar
              excalidrawAPI={excalidrawAPI}
              onToggleWebcam={toggleWebcam}  // ✅ Webcam toggle restored
              setIsStreamMode={setIsStreamMode}
              setWebcamOn={setWebcamOn}
              webcamOn={webcamOn}
              onToggleRecording={toggleRecording}
              isRecording={isRecording}
              setRoomUrl={setRoomUrl}
            />

            <div className={`custom-toolbar ${isStreamMode ? "stream-toolbar" : ""}`}>
              <CustomToolbar
                excalidrawAPI={excalidrawAPI}
                onToolSelect={(toolType: string) => setSelectedTool(toolType)}
              />
            </div>
          </>
        )}

        {/* Excalidraw Canvas */}
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api as unknown as CustomExcalidrawAPI)}
          initialData={{
            appState: { viewBackgroundColor: isStreamMode ? "transparent" : "#ffffff", gridSize: null },
          }}
        />

        {/* Video Player */}
        {isVideoPlayerVisible && (
          <div className="floating-video">
            <VideoPlayer playbackMode={playbackMode} />
          </div>
        )}

        {/* Diagram Sidebar */}
        <DiagramSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onDragStart={handleDiagramDragStart}
        />

        {/* Recording Indicator */}
        <Recording isRecording={isRecording} />
      </div>
    </DailyProvider>
  );
}

export default App;
