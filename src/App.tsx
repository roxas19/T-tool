// src/App.tsx
import React, { useState } from "react";
import { AppProviders } from "./context/AppProviders";
import MainToolbar from "./MainToolbar";
import ExcalidrawGeneral from "./ExcalidrawGeneral";
import Recording from "./Recording";
import VideoPlayer from "./VideoPlayer";
import PdfViewer from "./PDFViewer";
import WebcamDisplay from "./RealView";
import MeetingApp from "./MeetingApp";
import MinimizedMeetingPanel from "./Meeting/MinimizedMeetingPanel";
import SmallWebcam from "./Webcam"; // Small webcam component
import { MediaToggleProvider } from "./Meeting/MediaToggleContext";
import { usePageNavigation } from "./hooks/usePageNavigation";
import { useSmallWebcamVisibility } from "./hooks/useWebcamVisibility";

// Import specialized context hooks
import { useMeetingContext } from "./context/MeetingContext";
import { usePdfContext } from "./context/PdfContext";
import { useRealViewContext } from "./context/RealViewContext";
import { useOverlayManager } from "./context/OverlayManagerContext";

import "./css/App.css";


const AppContent: React.FC = () => {
  // Page navigation hook.
  const { currentPage } = usePageNavigation(null);

  // Local state for recording and video player.
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<"youtube" | "local">("youtube");

  // Local state for the small webcam overlay.
  const [isSmallWebcamActive, setIsSmallWebcamActive] = useState(false);

  // Use specialized contexts.
  const { pdfState, pdfDispatch } = usePdfContext();
  const { meetingState, meetingDispatch } = useMeetingContext();
  const { realViewState, realViewDispatch } = useRealViewContext();
  const { overlayState, overlayDispatch } = useOverlayManager();

  // Determine the active overlay (for PDF, RealView, Meeting) via the overlay manager.
  const activeOverlay =
    overlayState.activeStack[overlayState.activeStack.length - 1];

  // Derive whether the meeting overlay is minimized.
  const isMeetingMinimized = meetingState.isActive && activeOverlay !== "meeting";

  // Compute the effective visibility of the small webcam overlay.
  // It should be visible if toggled on, unless a meeting or RealView overlay is active.
  const smallWebcamVisible = useSmallWebcamVisibility(isSmallWebcamActive, overlayState.activeStack);

  // Handler for PDF uploads.
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    pdfDispatch({ type: "OPEN_PDF_VIEWER", payload: fileUrl });
    overlayDispatch({ type: "PUSH_OVERLAY", payload: "pdf" });
    // In this design, we do not force the small webcam off when PDF is active.
  };

  return (
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar always rendered */}
      <MainToolbar
        onToggleRecording={() => setIsRecording((prev) => !prev)}
        isRecording={isRecording}
        onPdfUpload={handlePdfUpload}
        onToggleSmallWebcam={() => setIsSmallWebcamActive((prev) => !prev)}
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

      {/* Render RealView overlay */}
      {realViewState.on && realViewState.isStreamMode && (
        <div className={`realview-overlay-wrapper ${activeOverlay === "realview" ? "" : "hidden"}`}>
          <WebcamDisplay
            onClose={() => {
              realViewDispatch({ type: "SET_REALVIEW_STREAM_MODE", payload: false });
              realViewDispatch({ type: "SET_REALVIEW_ON", payload: false });
              overlayDispatch({ type: "POP_OVERLAY" });
            }}
          />
        </div>
      )}

      {/* Render Small Webcam overlay independently */}
      {smallWebcamVisible && (
        <div className="small-webcam-wrapper">
          <SmallWebcam onClose={() => setIsSmallWebcamActive(false)} />
        </div>
      )}

      {/* Render Meeting overlay */}
      {meetingState.isActive && (
        <MediaToggleProvider>
          <div className={`meeting-overlay ${activeOverlay === "meeting" ? "" : "hidden"}`}>
            <div className="meeting-header">
              <span>Meeting in Progress</span>
              <button
                onClick={() => {
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

const App: React.FC = () => (
  <AppProviders>
    <AppContent />
  </AppProviders>
);

export default App;
