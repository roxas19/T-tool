// App.tsx
import React from "react";

// Custom components
import WebcamDisplay from "./WebcamDisplay";
import VideoPlayer from "./VideoPlayer";
import Recording from "./Recording";
import ExcalidrawGeneral from "./ExcalidrawGeneral"; // Handles canvas & toolbar (including AI mode)
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
import "./css/Excalidraw.css"; // Import dedicated Excalidraw CSS

// ---------------------
// OverlayManager Component: Renders all overlays as siblings
// ---------------------
const OverlayManager: React.FC = () => {
  const {
    pdfViewerMode,
    pdfSrc,
    setPdfViewerMode,
    setPdfSrc,
    setDisplayMode,
    isStreamMode,
    setIsStreamMode,
    webcamOn,
    setWebcamOn,
    isWebcamOverlayVisible,
    setIsWebcamOverlayVisible,
    isMeetingActive,
    isMeetingMinimized,
    setIsMeetingActive,
    setIsMeetingMinimized,
    setMeetingState,
  } = useGlobalUI();

  const handlePdfClose = () => {
    setPdfViewerMode(false);
    setPdfSrc(null);
    setDisplayMode("regular");
  };

  const handleWebcamClose = () => {
    if (isStreamMode) {
      setIsStreamMode(false);
      if (webcamOn) setIsWebcamOverlayVisible(true);
    } else {
      setWebcamOn(false);
      setIsWebcamOverlayVisible(false);
    }
  };

  return (
    <>
      {/* PDF Viewer Overlay */}
      {pdfViewerMode && pdfSrc && (
        <PdfViewer src={pdfSrc} onClose={handlePdfClose} />
      )}

      {/* Webcam Overlay */}
      {(webcamOn && (isStreamMode || isWebcamOverlayVisible)) && (
        <WebcamDisplay onClose={handleWebcamClose} />
      )}

      {/* Meeting Overlay */}
      {isMeetingActive && (
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
      )}

      {/* Additional overlays (e.g., floating video) can be added here */}
    </>
  );
};

// ---------------------
// AppContent Component: Main layout & base content
// ---------------------
const AppContent: React.FC = () => {
  // Page navigation hook.
  const { savePage, loadPage, currentPage, setCurrentPage } = usePageNavigation(null);

  // Retrieve global states from the UI context, including PDF-related setters.
  const {
    pdfViewerMode,
    pdfSrc,
    setPdfViewerMode,
    setPdfSrc,
    isRecording,
    setIsRecording,
    setIsMeetingActive
  } = useGlobalUI();

  // Local state for floating video player.
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = React.useState(false);
  const [playbackMode, setPlaybackMode] = React.useState<"youtube" | "local">("youtube");

  // Handler for PDF uploads.
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setPdfSrc(fileUrl);
    setPdfViewerMode(true);
  };

  return (
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar always rendered */}
      <MainToolbar 
        onToggleRecording={() => setIsRecording((prev) => !prev)}
        isRecording={isRecording}
        setIsMeetingActive={() => setIsMeetingActive(true)}
        onPdfUpload={handlePdfUpload}
      />

      {/* Render overlays via OverlayManager */}
      <OverlayManager />

      {/* ExcalidrawGeneral is always rendered */}
      <ExcalidrawGeneral />

      {/* Optional: Floating Video Player */}
      {isVideoPlayerVisible && (
        <div className="floating-video">
          <VideoPlayer playbackMode={playbackMode} />
        </div>
      )}

      <Recording isRecording={isRecording} />
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
