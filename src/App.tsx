import React, { useState } from "react";
import { AppProviders } from "./context/AppProviders";
import MainToolbar from "./MainToolBar/MainToolbar";
import ExcalidrawGeneral from "./ExcalidrawGeneral";
import Recording from "./Recording";
import VideoPlayer from "./VideoPlayer";
import PdfViewer from "./PDFViewer";
import WebcamDisplay from "./RealView";
import MeetingApp from "./MeetingApp";
import SmallWebcam from "./Webcam"; // Small webcam component
import { MediaToggleProvider } from "./Meeting/MediaToggleContext";
import { usePageNavigation } from "./hooks/usePageNavigation";
import { useSmallWebcamVisibility } from "./hooks/useWebcamVisibility";

// Import specialized context hooks
import { usePdfContext } from "./context/PdfContext";
import { useRealViewContext } from "./context/RealViewContext";
import { useOverlayManager } from "./context/OverlayManagerContext";
import { useMeetingContext } from "./context/MeetingContext";

import "./css/App.css";
import "./css/MeetingApp.css";

const AppContent: React.FC = () => {
  // Page navigation hook.
  const { currentPage } = usePageNavigation(null);

  // Local state for video player and small webcam.
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<"youtube" | "local">("youtube");
  const [isSmallWebcamActive, setIsSmallWebcamActive] = useState(false);

  // Use specialized contexts.
  const { pdfState, pdfDispatch } = usePdfContext();
  const { realViewState, realViewDispatch } = useRealViewContext();
  const { overlayState, overlayDispatch } = useOverlayManager();
  const { meetingState } = useMeetingContext();

  // Determine the active overlay from the overlay manager's stack.
  const activeOverlay = overlayState.activeStack[overlayState.activeStack.length - 1];

  // Compute the effective visibility for the small webcam overlay.
  const smallWebcamVisible = useSmallWebcamVisibility(isSmallWebcamActive, overlayState.activeStack);

  // Handler for PDF uploads.
  const handlePdfUpload = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    pdfDispatch({ type: "OPEN_PDF_VIEWER", payload: fileUrl });
    overlayDispatch({ type: "PUSH_OVERLAY", payload: "pdf" });
  };

  return (
    <div className="app-container" style={{ height: "100vh", position: "relative" }}>
      {/* Main Toolbar always rendered */}
      <MainToolbar
        onPdfUpload={handlePdfUpload}
        isSmallWebcamActive={isSmallWebcamActive}
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
          <SmallWebcam />
        </div>
      )}

      {/* Render Meeting overlay if meeting is active.
          MeetingApp remains mounted as long as meetingState.isActive is true.
          Its container receives the "hidden" class when meeting is not the active overlay. */}
      {meetingState.isActive && (
        <MediaToggleProvider>
          <div
            className={`meeting-overlay ${activeOverlay === "meeting" ? "" : "hidden"}`}
            style={{ zIndex: overlayState.overlayZIndices.overlay }}
          >
            <MeetingApp />
          </div>
        </MediaToggleProvider>
      )}

      {/* Always render ExcalidrawGeneral. 
          ExcalidrawGeneral itself determines whether to hide via its internal logic
          (based on pdf, realview, and meeting contexts). */}
      <ExcalidrawGeneral />

      {/* Optional: Floating Video Player */}
      {isVideoPlayerVisible && (
        <div className="floating-video">
          <VideoPlayer playbackMode={playbackMode} />
        </div>
      )}

      {/* Recording component (uses recording module internally) */}
      <Recording />
    </div>
  );
};

const App: React.FC = () => (
  <AppProviders>
    <AppContent />
  </AppProviders>
);

export default App;