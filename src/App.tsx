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

// Typings
type ExcalidrawElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  [key: string]: any;
};

const AppContent: React.FC = () => {
  // Page navigation logic.
  const { savePage, loadPage, currentPage, setCurrentPage } = usePageNavigation(null);

  // Retrieve global states from the UI context.
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
    displayMode,
    setDisplayMode,
  } = useGlobalUI();

  // Local states
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = React.useState(false);
  const [playbackMode, setPlaybackMode] = React.useState<"youtube" | "local">("youtube");

  // Handler for closing the webcam.
  const handleWebcamClose = () => {
    if (isStreamMode) {
      setIsStreamMode(false);
      if (webcamOn) setIsWebcamOverlayVisible(true);
    } else {
      setWebcamOn(false);
      setIsWebcamOverlayVisible(false);
    }
  };

  // Handler for PDF uploads.
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setPdfSrc(fileUrl);
    setPdfViewerMode(true);
  };

  return (
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar uses global state directly */}
      <MainToolbar 
        onToggleRecording={() => setIsRecording((prev) => !prev)}
        isRecording={isRecording}
        setIsMeetingActive={setIsMeetingActive}
        onPdfUpload={handlePdfUpload}
      />

      {pdfViewerMode && pdfSrc ? (
        // Render PdfViewer directly (it internally splits its content and controls as siblings)
        <PdfViewer
          src={pdfSrc}
          onClose={() => {
            setPdfViewerMode(false);
            setPdfSrc(null);
            // Reset draw mode when closing the PDF viewer.
            setDisplayMode("regular");
          }}
        />
      ) : (
        // When not in PDF viewer mode, render other app components.
        <>
          <WebcamDisplay onClose={handleWebcamClose} />

          {isVideoPlayerVisible && (
            <div className="floating-video">
              <VideoPlayer playbackMode={playbackMode} />
            </div>
          )}

          <Recording isRecording={isRecording} />

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

      {/* Always render ExcalidrawGeneral once */}
      <ExcalidrawGeneral />
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
