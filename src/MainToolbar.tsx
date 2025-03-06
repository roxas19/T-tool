// src/MainToolbar.tsx
import React from "react";
import { useExcalidrawContext } from "./context/ExcalidrawContext";
import { useWebcamContext } from "./context/WebcamContext";
import { useMeetingContext } from "./context/MeetingContext";
import { useOverlayManager } from "./context/OverlayManagerContext";

type MainToolbarProps = {
  onToggleRecording: () => void;
  isRecording: boolean;
  onPdfUpload: (file: File) => void;
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  onToggleRecording,
  isRecording,
  onPdfUpload,
}) => {
  // Excalidraw: Use specialized context for API.
  const { excalidrawState } = useExcalidrawContext();

  // Webcam: Use specialized context for webcam state and dispatch.
  const { webcamState, webcamDispatch } = useWebcamContext();

  // Meeting: Use specialized context for meeting state and dispatch.
  const { meetingDispatch } = useMeetingContext();

  // Overlay Manager: Use specialized context for active overlay.
  const { overlayDispatch } = useOverlayManager();

  // Reset the Excalidraw canvas.
  const handleResetCanvas = () => {
    excalidrawState.api?.updateScene({
      elements: [],
      appState: {
        ...excalidrawState.api.getAppState(),
        viewBackgroundColor: "#ffffff",
      },
    });
  };

  // Activate the image upload tool.
  const handleImageUpload = () => {
    excalidrawState.api?.setActiveTool({
      type: "image",
      insertOnCanvasDirectly: true,
    });
    console.log("Image tool activated for upload.");
  };

  // Handle PDF file selection.
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
      e.target.value = "";
    }
  };

  // Toggle the webcam on/off via dispatching actions.
  const toggleWebcam = () => {
    if (webcamState.on) {
      webcamDispatch({ type: "SET_WEBCAM_ON", payload: false });
      webcamDispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: false });
    } else {
      webcamDispatch({ type: "SET_WEBCAM_ON", payload: true });
      webcamDispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: true });
    }
  };

  return (
    <div className="main-toolbar">
      <button onClick={handleResetCanvas}>Reset</button>
      <button onClick={handleImageUpload}>Upload Image</button>

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

      <button onClick={toggleWebcam}>Toggle Webcam</button>

      <button
        onClick={() => {
          webcamDispatch({ type: "SET_WEBCAM_STREAM_MODE", payload: true });
          webcamDispatch({ type: "SET_WEBCAM_ON", payload: true });
          webcamDispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: false });
          overlayDispatch({ type: "SET_ACTIVE_BACKGROUND", payload: "webcam" });
        }}
      >
        Stream View
      </button>

      <button onClick={onToggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <button onClick={() => meetingDispatch({ type: "OPEN_MEETING" })}>
        Start Meeting
      </button>
    </div>
  );
};

export default MainToolbar;
