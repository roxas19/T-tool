// App.tsx
import React from "react";

// Custom components
import WebcamDisplay from "./WebcamDisplay";
import DiagramSidebar from "./DiagramSidebar";
import VideoPlayer from "./VideoPlayer";
import Recording from "./Recording";
import ExcalidrawComponent from "./ExcalidrawComponent";
import MeetingApp from "./MeetingApp";
import MainToolbar from "./MainToolbar";
import MinimizedMeetingPanel from "./Meeting/MinimizedMeetingPanel";
import PdfViewer from "./PDFViewer";

// Media toggle context provider
import { MediaToggleProvider } from "./Meeting/MediaToggleContext";

// Hooks
import { usePageNavigation } from "./hooks/usePageNavigation";
import { useWebcamManager } from "./hooks/useWebcamManager";

// Global UI Context
import { GlobalUIProvider, useGlobalUI } from "./context/GlobalUIContext";

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

// Separate App content component that uses the global UI context
const AppContent: React.FC = () => {
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

  // Global UI state from context
  const {
    pdfViewerMode,
    setPdfViewerMode,
    pdfSrc,
    setPdfSrc,
    isRecording,
    setIsRecording,
    isMeetingActive,
    setIsMeetingActive,
    isMeetingMinimized,
    setIsMeetingMinimized,
    meetingState,
    setMeetingState,
    displayMode,
    setDisplayMode,
  } = useGlobalUI();

  // Local states that remain local
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = React.useState(false);
  const [playbackMode, setPlaybackMode] = React.useState<"youtube" | "local">("youtube");

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
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar */}
      <MainToolbar
        excalidrawAPI={null} // Replace with your excalidrawAPI reference as needed
        onToggleWebcam={toggleWebcam}
        setIsStreamMode={setIsStreamMode}
        setWebcamOn={setWebcamOn}
        webcamOn={webcamOn}
        onToggleRecording={() => setIsRecording((prev) => !prev)}
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
            onToggleDrawingMode={(mode) => setDisplayMode(mode)}
            displayMode={displayMode}
          />

          {/* Excalidraw Component */}
          <ExcalidrawComponent displayMode={displayMode} setExcalidrawAPI={() => {}} />

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
              <MediaToggleProvider>
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

                  <MeetingApp
                    isMeetingMinimized={isMeetingMinimized}
                    onMeetingStart={() => setMeetingState("inProgress")}
                    onClose={() => {
                      setIsMeetingActive(false);
                      setMeetingState("setup");
                    }}
                  />
                </div>

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

const App: React.FC = () => {
  return (
    <GlobalUIProvider>
      <AppContent />
    </GlobalUIProvider>
  );
};

export default App;
