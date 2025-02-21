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

// Separate App content component that uses the global UI context.
const AppContent: React.FC = () => {
  // Page navigation logic.
  const { savePage, loadPage, currentPage, setCurrentPage } = usePageNavigation(null);

  // Retrieve all webcam and related states from the global context.
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
    isStreamMode,
    setIsStreamMode,
    webcamOn,
    setWebcamOn,
    isWebcamOverlayVisible,
    setIsWebcamOverlayVisible,
  } = useGlobalUI();

  // Local states that remain local.
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = React.useState(false);
  const [playbackMode, setPlaybackMode] = React.useState<"youtube" | "local">("youtube");

  // Handler for closing the webcam.
  const handleWebcamClose = () => {
    // If we're in stream view, exit stream view and show the small overlay.
    if (isStreamMode) {
      setIsStreamMode(false);
      if (webcamOn) setIsWebcamOverlayVisible(true);
    } else {
      setWebcamOn(false);
      setIsWebcamOverlayVisible(false);
    }
  };

  const handleDiagramDragStart = (elements: ExcalidrawElement[]) => {
    console.log("Drag started for elements:", elements);
  };

  // Handler for PDF uploads from MainToolbar.
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setPdfSrc(fileUrl);
    setPdfViewerMode(true);
  };

  return (
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar: No webcam-related props are passed now because MainToolbar uses global state directly. */}
      <MainToolbar 
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
        // Render regular app components when PDF viewer is not active.
        <>
          {/* Webcam Overlay */}
          <WebcamDisplay onClose={handleWebcamClose} />

          {/* Excalidraw Component */}
          <ExcalidrawComponent />

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
