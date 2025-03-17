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
  onDownloadLast15: () => void;
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  onToggleRecording,
  isRecording,
  onPdfUpload,
  onToggleSmallWebcam,
  onDownloadLast15,
}) => {
  const { pdfState, pdfDispatch } = usePdfContext();
  const { realViewState, realViewDispatch } = useRealViewContext();
  const { meetingDispatch } = useMeetingContext();
  const { overlayDispatch } = useOverlayManager();

  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
      e.target.value = "";
    }
  };

  const triggerFileUpload = () => {
    pdfInputRef.current?.click();
  };

  const handlePdfButtonClick = () => {
    if (pdfState.isViewerActive) {
      pdfDispatch({ type: "CLOSE_PDF_VIEWER" });
    } else {
      triggerFileUpload();
    }
  };

  return (
    <div className="main-toolbar">
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

      <RecordButton
        isRecording={isRecording}
        onToggleRecording={onToggleRecording}
        onDownloadLast15={onDownloadLast15}
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
