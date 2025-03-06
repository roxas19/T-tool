// src/App.tsx
import React from "react";
import { AppProviders } from "./context/AppProviders";
import MainToolbar from "./MainToolbar";
import ExcalidrawGeneral from "./ExcalidrawGeneral";
import Recording from "./Recording";
import VideoPlayer from "./VideoPlayer";
import PdfViewer from "./PDFViewer";
import WebcamDisplay from "./WebcamDisplay";
import MeetingApp from "./MeetingApp";
import MinimizedMeetingPanel from "./Meeting/MinimizedMeetingPanel";
import { MediaToggleProvider } from "./Meeting/MediaToggleContext";
import { usePageNavigation } from "./hooks/usePageNavigation";

// Import specialized context hooks
import { useMeetingContext } from "./context/MeetingContext";
import { usePdfContext } from "./context/PdfContext";
import { useWebcamContext } from "./context/WebcamContext";
import { useOverlayManager } from "./context/OverlayManagerContext";

import "./css/App.css";
import "./css/Excalidraw.css";

const AppContent: React.FC = () => {
  // Page navigation hook (if needed)
  const { currentPage } = usePageNavigation(null);

  // Local state for recording (managed locally)
  const [isRecording, setIsRecording] = React.useState(false);
  // Local state for floating video player.
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = React.useState(false);
  const [playbackMode, setPlaybackMode] = React.useState<"youtube" | "local">("youtube");

  // Use specialized contexts.
  const { pdfState, pdfDispatch } = usePdfContext();
  const { meetingState, meetingDispatch } = useMeetingContext();
  const { webcamState, webcamDispatch } = useWebcamContext();
  const { overlayState, overlayDispatch } = useOverlayManager();

  // Handler for PDF uploads.
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    pdfDispatch({ type: "OPEN_PDF_VIEWER", payload: fileUrl });
    // Mark the PDF overlay as active.
    overlayDispatch({ type: "SET_ACTIVE_BACKGROUND", payload: "pdf" });
  };

  return (
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar always rendered */}
      <MainToolbar
        onToggleRecording={() => setIsRecording((prev) => !prev)}
        isRecording={isRecording}
        onPdfUpload={handlePdfUpload}
      />

      {/* Render overlays based on active overlay from Overlay Manager */}
      {pdfState.isViewerActive && pdfState.src && overlayState.activeBackground === "pdf" && (
        <PdfViewer
          src={pdfState.src}
          onClose={() => {
            pdfDispatch({ type: "CLOSE_PDF_VIEWER" });
            overlayDispatch({ type: "SET_ACTIVE_BACKGROUND", payload: null });
          }}
        />
      )}

      {(webcamState.on &&
        (webcamState.isStreamMode || webcamState.isOverlayVisible) &&
        overlayState.activeBackground === "webcam") && (
        <WebcamDisplay
          onClose={() => {
            webcamDispatch({ type: "SET_WEBCAM_STREAM_MODE", payload: false });
            webcamDispatch({ type: "SET_WEBCAM_ON", payload: false });
            webcamDispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: false });
            overlayDispatch({ type: "SET_ACTIVE_BACKGROUND", payload: null });
          }}
        />
      )}

      {meetingState.isActive && overlayState.activeBackground === "meeting" && (
        <MediaToggleProvider>
          <div className={`meeting-overlay ${meetingState.isMinimized ? "hidden" : ""}`}>
            <div className="meeting-header">
              <span>Meeting in Progress</span>
              <button onClick={() => meetingDispatch({ type: "MINIMIZE_MEETING" })}>
                Minimize
              </button>
              <button onClick={() => meetingDispatch({ type: "CLOSE_MEETING" })}>
                Close Meeting
              </button>
            </div>
            <MeetingApp
              isMeetingMinimized={meetingState.isMinimized}
              onMeetingStart={() => meetingDispatch({ type: "OPEN_MEETING" })}
              onClose={() => meetingDispatch({ type: "CLOSE_MEETING" })}
            />
          </div>
          {meetingState.isMinimized && (
            <MinimizedMeetingPanel onMaximize={() => meetingDispatch({ type: "OPEN_MEETING" })} />
          )}
        </MediaToggleProvider>
      )}

      {/* ExcalidrawGeneral is always rendered */}
      <ExcalidrawGeneral />

      {/* Optional: Floating Video Player */}
      {isVideoPlayerVisible && (
        <div className="floating-video">
          <VideoPlayer playbackMode={playbackMode} />
        </div>
      )}

      {/* Recording component is managed locally */}
      <Recording isRecording={isRecording} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;
