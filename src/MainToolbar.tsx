// src/MainToolbar.tsx
import React from "react";
import { useExcalidrawContext } from "./context/ExcalidrawContext";
import { useRealViewContext } from "./context/RealViewContext";
import { useMeetingContext } from "./context/MeetingContext";
import { useOverlayManager } from "./context/OverlayManagerContext";

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
  // Excalidraw context for canvas API (reset and image upload are now handled in the side toolbar).
  const { excalidrawState } = useExcalidrawContext();

  // RealView context now replaces the old webcam context.
  const { realViewState, realViewDispatch } = useRealViewContext();

  // Meeting context for meeting state.
  const { meetingDispatch } = useMeetingContext();

  // Overlay Manager to coordinate active overlays.
  const { overlayDispatch } = useOverlayManager();

  // Handle PDF file selection.
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
      e.target.value = "";
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
      {/* PDF Upload Button */}
      <label htmlFor="pdf-upload" className="pdf-upload-button">
        Upload PDF
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handlePdfChange}
          style={{ display: "none" }}
        />
      </label>

      {/* Toggle Small Webcam Overlay */}
      <button onClick={onToggleSmallWebcam}>Toggle Webcam</button>

      <button
        onClick={() => {
          realViewDispatch({ type: "SET_REALVIEW_STREAM_MODE", payload: true });
          realViewDispatch({ type: "SET_REALVIEW_ON", payload: true });
          // Push the RealView overlay onto the stack.
          overlayDispatch({ type: "PUSH_OVERLAY", payload: "realview" });
        }}
      >
        Real View
      </button>

      <button onClick={onToggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {/* Meeting Button: Opens meeting overlay */}
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
