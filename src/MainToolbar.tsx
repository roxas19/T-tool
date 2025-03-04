// src/MainToolbar.tsx
import React from "react";
import { useGlobalUI } from "./context/GlobalUIContext";

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
  const { state, dispatch } = useGlobalUI();

  // Reset the Excalidraw canvas.
  const handleResetCanvas = () => {
    state.excalidrawAPI?.updateScene({
      elements: [],
      appState: {
        ...state.excalidrawAPI.getAppState(),
        viewBackgroundColor: "#ffffff",
      },
    });
  };

  // Activate the image upload tool.
  const handleImageUpload = () => {
    state.excalidrawAPI?.setActiveTool({
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
    if (state.webcam.on) {
      dispatch({ type: "SET_WEBCAM_ON", payload: false });
      dispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: false });
    } else {
      dispatch({ type: "SET_WEBCAM_ON", payload: true });
      dispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: true });
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
          dispatch({ type: "SET_WEBCAM_STREAM_MODE", payload: true });
          dispatch({ type: "SET_WEBCAM_ON", payload: true });
          dispatch({ type: "SET_WEBCAM_OVERLAY_VISIBLE", payload: false });
        }}
      >
        Stream View
      </button>

      <button onClick={onToggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <button onClick={() => dispatch({ type: "OPEN_MEETING" })}>
        Start Meeting
      </button>
    </div>
  );
};

export default MainToolbar;
