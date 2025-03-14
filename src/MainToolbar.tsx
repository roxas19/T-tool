import React, { useRef } from "react";
import { useExcalidrawContext } from "./context/ExcalidrawContext";
import { useRealViewContext } from "./context/RealViewContext";
import { useMeetingContext } from "./context/MeetingContext";
import { useOverlayManager } from "./context/OverlayManagerContext";
import { usePdfContext } from "./context/PdfContext";
import RecordButton from "./utils/RecordButton"; // Import the dynamic record button component
import "./css/MainToolbar.css";

type MainToolbarProps = {
  onToggleRecording: () => void;
  isRecording: boolean;
  onPdfUpload: (file: File) => void;
  onToggleSmallWebcam: () => void;
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  onToggleRecording,
  isRecording,
  onPdfUpload,
  onToggleSmallWebcam,
}) => {
  const { excalidrawState } = useExcalidrawContext();
  const { realViewState, realViewDispatch } = useRealViewContext();
  const { meetingDispatch } = useMeetingContext();
  const { overlayDispatch } = useOverlayManager();
  const { pdfState, pdfDispatch } = usePdfContext();

  // Use a ref for the file input.
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection.
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
      e.target.value = "";
    }
  };

  // Programmatically trigger the file input.
  const triggerFileUpload = () => {
    pdfInputRef.current?.click();
  };

  // Handle PDF button click based on current state.
  const handlePdfButtonClick = () => {
    if (pdfState.isViewerActive) {
      // Exit PDF viewer.
      pdfDispatch({ type: "CLOSE_PDF_VIEWER" });
    } else {
      // Trigger file upload.
      triggerFileUpload();
    }
  };

  // Toggle RealView on/off.
  const toggleRealView = () => {
    if (realViewState.on) {
      realViewDispatch({ type: "SET_REALVIEW_ON", payload: false });
    } else {
      realViewDispatch({ type: "SET_REALVIEW_ON", payload: true });
    }
  };

  return (
    <div className="main-toolbar">
      {/* Dynamic PDF Button */}
      <button onClick={handlePdfButtonClick} className="pdf-upload-button">
        {pdfState.isViewerActive ? "Exit PDF" : "Upload PDF"}
      </button>
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        style={{ display: "none" }}
      />

      {/* Toggle Small Webcam Overlay */}
      <button onClick={onToggleSmallWebcam}>Toggle Webcam</button>

      <button
        onClick={() => {
          realViewDispatch({ type: "SET_REALVIEW_STREAM_MODE", payload: true });
          realViewDispatch({ type: "SET_REALVIEW_ON", payload: true });
          overlayDispatch({ type: "PUSH_OVERLAY", payload: "realview" });
        }}
      >
        Real View
      </button>

      {/* Dynamic Record Button */}
      <RecordButton
        isRecording={isRecording}
        onToggleRecording={onToggleRecording}
        onDownloadLast15={() => {
          // This function should trigger the download of the last 15 minutes.
          console.log("Download last 15 minutes triggered.");
        }}
      />

      <button
        onClick={() => {
          meetingDispatch({ type: "OPEN_MEETING" });
          overlayDispatch({ type: "PUSH_OVERLAY", payload: "meeting" });
        }}
      >
        Start Meeting
      </button>
    </div>
  );
};

export default MainToolbar;
