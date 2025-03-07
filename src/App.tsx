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

  // Determine the active overlay (top of the stack)
  const activeOverlay =
    overlayState.activeStack[overlayState.activeStack.length - 1];

  // Derive whether the meeting overlay is minimized:
  // If meeting is active but the active overlay is not "meeting", it's minimized.
  const isMeetingMinimized = meetingState.isActive && activeOverlay !== "meeting";

  // Handler for PDF uploads.
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    pdfDispatch({ type: "OPEN_PDF_VIEWER", payload: fileUrl });
    // Push the PDF overlay onto the stack.
    overlayDispatch({ type: "PUSH_OVERLAY", payload: "pdf" });
  };

  return (
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar always rendered */}
      <MainToolbar
        onToggleRecording={() => setIsRecording((prev) => !prev)}
        isRecording={isRecording}
        onPdfUpload={handlePdfUpload}
      />

      {/* Render PDF overlay */}
      {pdfState.isViewerActive && pdfState.src && (
        <div className={`pdf-viewer-wrapper ${activeOverlay === "pdf" ? "" : "hidden"}`}>
          <PdfViewer
            src={pdfState.src}
            onClose={() => {
              pdfDispatch({ type: "CLOSE_PDF_VIEWER" });
              overlayDispatch({ type: "POP_OVERLAY" });
            }}
          />
        </div>
      )}

      {/* Render Webcam overlay */}
      {webcamState.on && (webcamState.isStreamMode || webcamState.isOverlayVisible) && (
        <div className={`webcam-overlay-wrapper ${activeOverlay === "webcam" ? "" : "hidden"}`}>
          <WebcamDisplay
            onClose={() => {
              webcamDispatch({ type: "SET_WEBCAM_STREAM_MODE", payload: false });
              webcamDispatch({ type: "SET_WEBCAM_ON", payload: false });
              webcamDispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: false });
              overlayDispatch({ type: "POP_OVERLAY" });
            }}
          />
        </div>
      )}

      {/* Render Meeting overlay; visibility is based on the active overlay */}
      {meetingState.isActive && (
        <MediaToggleProvider>
          <div className={`meeting-overlay ${activeOverlay === "meeting" ? "" : "hidden"}`}>
            <div className="meeting-header">
              <span>Meeting in Progress</span>
              {/* You can still dispatch internal meeting actions if needed.
                  Note: Minimization is now derived from the overlay manager. */}
              <button
                onClick={() => {
                  // Optionally, you might want to pop the meeting overlay to minimize it.
                  overlayDispatch({ type: "POP_OVERLAY" });
                }}
              >
                Minimize
              </button>
              <button
                onClick={() => {
                  meetingDispatch({ type: "CLOSE_MEETING" });
                  overlayDispatch({ type: "POP_OVERLAY" });
                }}
              >
                Close Meeting
              </button>
            </div>
            <MeetingApp
              isMeetingMinimized={isMeetingMinimized}
              onMeetingStart={() => {
                meetingDispatch({ type: "OPEN_MEETING" });
                // When restarting the meeting, push it onto the overlay stack.
                overlayDispatch({ type: "PUSH_OVERLAY", payload: "meeting" });
              }}
              onClose={() => {
                meetingDispatch({ type: "CLOSE_MEETING" });
                overlayDispatch({ type: "POP_OVERLAY" });
              }}
            />
          </div>
          {isMeetingMinimized && (
            <MinimizedMeetingPanel
              onMaximize={() =>
                overlayDispatch({ type: "PUSH_OVERLAY", payload: "meeting" })
              }
            />
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
