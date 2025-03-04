// src/App.tsx
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

// Media toggle context provider (if still used for meeting-specific toggles)
import { MediaToggleProvider } from "./Meeting/MediaToggleContext";

// Hooks
import { usePageNavigation } from "./hooks/usePageNavigation";

// Global UI Context (our new reducer‑based implementation)
import { GlobalUIProvider, useGlobalUI } from "./context/GlobalUIContext";

// Styles
import "./css/App.css";
import "./css/Excalidraw.css"; // Import dedicated Excalidraw CSS

// ---------------------
// OverlayManager Component: Renders all overlays as siblings
// ---------------------
const OverlayManager: React.FC = () => {
  const { state, dispatch } = useGlobalUI();

  const handlePdfClose = () => {
    dispatch({ type: "CLOSE_PDF_VIEWER" });
    dispatch({ type: "SET_DISPLAY_MODE", payload: "regular" });
  };

  const handleWebcamClose = () => {
    dispatch({ type: "SET_WEBCAM_STREAM_MODE", payload: false });
    dispatch({ type: "SET_WEBCAM_ON", payload: false });
    dispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: false });
  };

  return (
    <>
      {/* PDF Viewer Overlay */}
      {state.pdf.isViewerActive && state.pdf.src && (
        <PdfViewer src={state.pdf.src} onClose={handlePdfClose} />
      )}

      {/* Webcam Overlay */}
      {(state.webcam.on && (state.webcam.isStreamMode || state.webcam.isOverlayVisible)) && (
        <WebcamDisplay onClose={handleWebcamClose} />
      )}

      {/* Meeting Overlay */}
      {state.meeting.isActive && (
        <MediaToggleProvider>
          <div className={`meeting-overlay ${state.meeting.isMinimized ? "hidden" : ""}`}>
            <div className="meeting-header">
              <span>Meeting in Progress</span>
              <button onClick={() => dispatch({ type: "MINIMIZE_MEETING" })}>
                Minimize
              </button>
              <button onClick={() => dispatch({ type: "CLOSE_MEETING" })}>
                Close Meeting
              </button>
            </div>
            <MeetingApp
              isMeetingMinimized={state.meeting.isMinimized}
              onMeetingStart={() => dispatch({ type: "OPEN_MEETING" })}
              onClose={() => dispatch({ type: "CLOSE_MEETING" })}
            />
          </div>
          {state.meeting.isMinimized && (
            <MinimizedMeetingPanel onMaximize={() => dispatch({ type: "OPEN_MEETING" })} />
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
  const { savePage, loadPage, currentPage, setCurrentPage } = usePageNavigation(null);
  const { state, dispatch } = useGlobalUI();

  // Local state for recording (managed locally rather than via global context)
  const [isRecording, setIsRecording] = React.useState(false);
  // Local state for floating video player.
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = React.useState(false);
  const [playbackMode, setPlaybackMode] = React.useState<"youtube" | "local">("youtube");

  // Handler for PDF uploads.
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    dispatch({ type: "OPEN_PDF_VIEWER", payload: fileUrl });
  };

  return (
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar always rendered */}
      <MainToolbar 
        onToggleRecording={() => setIsRecording((prev) => !prev)}
        isRecording={isRecording}
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
