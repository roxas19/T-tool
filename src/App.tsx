// App.tsx
import React, { useState } from "react";

// Custom components
import WebcamDisplay from "./WebcamDisplay";
import DiagramSidebar from "./DiagramSidebar";
import VideoPlayer from "./VideoPlayer";
import Recording from "./Recording";
import ExcalidrawComponent from "./ExcalidrawComponent";
import MeetingApp from "./MeetingApp";
import MainToolbar from "./MainToolbar";
import MinimizedMeetingPanel from "./Meeting/MinimizedMeetingPanel";
import PdfViewer from "./PDFViewer"; // Import the PDF Viewer component

// Media toggle context provider
import { MediaToggleProvider } from "./Meeting/MediaToggleContext";

// Hooks
import { usePageNavigation } from "./hooks/usePageNavigation";
import { useWebcamManager } from "./hooks/useWebcamManager";

// Styles
import "./css/App.css";

// Typings
type ExcalidrawElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  [key: string]: any;
};

const App: React.FC = () => {
  // Page navigation logic
  const { savePage, loadPage, currentPage, setCurrentPage } = usePageNavigation(null);

  // Webcam and stream state management
  const {
    webcamOn,
    isStreamMode,
    isWebcamOverlayVisible,
    setIsStreamMode,
    toggleWebcam,
    setWebcamOn,
    setWebcamOverlayVisible,
  } = useWebcamManager();

  // Meeting state
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMeetingMinimized, setIsMeetingMinimized] = useState(false);
  const [meetingState, setMeetingState] = useState<"setup" | "inProgress">("setup");
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const meetingId = "my-test-meeting"; // Hardcoded for testing (can be dynamic later)

  // Additional states
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<"youtube" | "local">("youtube");

  // New unified draw mode state: "regular" (standalone canvas) or "draw" (overlay mode)
  const [displayMode, setDisplayMode] = useState<"regular" | "draw">("regular");

  // New state for PDF Viewer Mode
  const [pdfViewerMode, setPdfViewerMode] = useState(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);

  // Toggles
  const toggleRecording = () => setIsRecording((prev) => !prev);
  const toggleVideoPlayer = () => setIsVideoPlayerVisible((prev) => !prev);

  const handleWebcamClose = () => {
    if (isStreamMode) {
      setIsStreamMode(false);
      if (webcamOn) setWebcamOverlayVisible(true);
    } else {
      setWebcamOn(false);
      setWebcamOverlayVisible(false);
    }
  };

  const handleDiagramDragStart = (elements: ExcalidrawElement[]) => {
    console.log("Drag started for elements:", elements);
  };

  // Handler for PDF uploads from MainToolbar
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setPdfSrc(fileUrl);
    setPdfViewerMode(true);
  };

  return (
    <div
      className="app-container"
      style={{ height: "100vh", position: "relative", overflow: "hidden" }}
    >
      {/* Main Toolbar with the new onPdfUpload prop */}
      <MainToolbar
        excalidrawAPI={excalidrawAPI}
        onToggleWebcam={toggleWebcam}
        setIsStreamMode={setIsStreamMode}
        setWebcamOn={setWebcamOn}
        webcamOn={webcamOn}
        onToggleRecording={toggleRecording}
        isRecording={isRecording}
        setIsMeetingActive={setIsMeetingActive}
        onPdfUpload={handlePdfUpload}
      />

      {/* PDF Viewer Overlay */}
      {pdfViewerMode && pdfSrc ? (
        <div
          className="pdf-viewer-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#fff",
            zIndex: 1000,
          }}
        >
          <PdfViewer
            src={pdfSrc}
            onClose={() => {
              setPdfViewerMode(false);
              setPdfSrc(null);
            }}
          />
        </div>
      ) : (
        // Render the regular app components when not in PDF viewer mode
        <>
          {/* Webcam Overlay */}
          <WebcamDisplay
            onClose={handleWebcamClose}
            fullscreen={isStreamMode}
            webcamOn={webcamOn}
            isWebcamOverlayVisible={isWebcamOverlayVisible}
            setWebcamOverlayVisible={setWebcamOverlayVisible}
            // When toggling drawing mode from the webcam overlay, update the unified displayMode:
            onToggleDrawingMode={(mode) => setDisplayMode(mode)}
            displayMode={displayMode}
          />

          {/* Excalidraw Component */}
          <ExcalidrawComponent
            displayMode={displayMode}
            setExcalidrawAPI={setExcalidrawAPI}
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

          {/* Meeting Overlay */}
          {isMeetingActive && (
            <>
              {/* Wrap the entire meeting overlay with MediaToggleProvider */}
              <MediaToggleProvider>
                {/* Full Meeting Overlay */}
                <div className={`meeting-overlay ${isMeetingMinimized ? "hidden" : ""}`}>
                  <div className="meeting-header">
                    <span>Meeting in Progress</span>
                    <button onClick={() => setIsMeetingMinimized(true)}>Minimize</button>
                    <button
                      onClick={() => {
                        setIsMeetingActive(false);
                        setMeetingState("setup");
                      }}
                    >
                      Close Meeting
                    </button>
                  </div>

                  {/* Meeting UI */}
                  <MeetingApp
                    isMeetingMinimized={isMeetingMinimized}
                    onMeetingStart={() => setMeetingState("inProgress")}
                    onClose={() => {
                      setIsMeetingActive(false);
                      setMeetingState("setup");
                    }}
                  />
                </div>

                {/* Minimized Meeting Panel */}
                {isMeetingMinimized && (
                  <MinimizedMeetingPanel onMaximize={() => setIsMeetingMinimized(false)} />
                )}
              </MediaToggleProvider>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;
