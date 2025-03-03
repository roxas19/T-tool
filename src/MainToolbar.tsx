import React from "react";
import { useGlobalUI } from "./context/GlobalUIContext";

type MainToolbarProps = {
  onToggleRecording: () => void;
  isRecording: boolean;
  setIsMeetingActive: React.Dispatch<React.SetStateAction<boolean>>;
  onPdfUpload: (file: File) => void;
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  onToggleRecording,
  isRecording,
  setIsMeetingActive,
  onPdfUpload,
}) => {
  const {
    webcamOn,
    setWebcamOn,
    setIsStreamMode,
    isWebcamOverlayVisible,
    setIsWebcamOverlayVisible,
    excalidrawAPI,
  } = useGlobalUI();

  const handleResetCanvas = () => {
    excalidrawAPI?.updateScene({
      elements: [],
      appState: {
        ...excalidrawAPI.getAppState(),
        viewBackgroundColor: "#ffffff",
      },
    });
  };

  const handleImageUpload = () => {
    excalidrawAPI?.setActiveTool({
      type: "image",
      insertOnCanvasDirectly: true,
    });
    console.log("Image tool activated for upload.");
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
      e.target.value = "";
    }
  };

  const toggleWebcam = () => {
    if (webcamOn) {
      setWebcamOn(false);
      setIsWebcamOverlayVisible(false);
    } else {
      setWebcamOn(true);
      setIsWebcamOverlayVisible(true);
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
          setIsStreamMode(true);
          setWebcamOn(true);
          setIsWebcamOverlayVisible(false);
        }}
      >
        Stream View
      </button>

      <button onClick={onToggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <button onClick={() => setIsMeetingActive(true)}>Start Meeting</button>
    </div>
  );
};

export default MainToolbar;
