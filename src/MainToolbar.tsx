import React from "react";
import { useGlobalUI } from "./context/GlobalUIContext"; // Import the global context hook

type MainToolbarProps = {
  excalidrawAPI: any;
  onToggleRecording: () => void;
  isRecording: boolean;
  setIsMeetingActive: React.Dispatch<React.SetStateAction<boolean>>;
  // New prop for PDF upload callback
  onPdfUpload: (file: File) => void;
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  excalidrawAPI,
  onToggleRecording,
  isRecording,
  setIsMeetingActive,
  onPdfUpload,
}) => {
  // Access global webcam and stream states from the global UI context.
  const {
    webcamOn,
    setWebcamOn,
    setIsStreamMode,
    isWebcamOverlayVisible,
    setIsWebcamOverlayVisible,
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

  const handleUndo = () => {
    (document.querySelector(".undo-button-container button") as HTMLButtonElement)?.click();
  };

  const handleRedo = () => {
    (document.querySelector(".redo-button-container button") as HTMLButtonElement)?.click();
  };

  const handleImageUpload = () => {
    excalidrawAPI?.setActiveTool({
      type: "image",
      insertOnCanvasDirectly: true,
    });
    console.log("Image tool activated for upload.");
  };

  // PDF file input handler
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
      // Clear the input value so that the same file can be re-uploaded if needed
      e.target.value = "";
    }
  };

  // Toggle Webcam: When pressed, it flips the webcamOn state and updates overlay visibility accordingly.
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
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <button onClick={handleImageUpload}>Upload Image</button>

      {/* PDF Upload Button */}
      <label
        htmlFor="pdf-upload"
        style={{
          cursor: "pointer",
          margin: "0 10px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "#fff",
          borderRadius: "4px",
          display: "inline-block",
        }}
      >
        Upload PDF
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handlePdfChange}
        />
      </label>

      {/* Webcam Toggle */}
      <button onClick={toggleWebcam}>Toggle Webcam</button>

      {/* Stream View (Enables Stream Mode and Webcam) */}
      <button
        onClick={() => {
          // Set stream mode to true, ensure webcam is on, and hide small overlay.
          setIsStreamMode(true);
          setWebcamOn(true);
          setIsWebcamOverlayVisible(false);
        }}
      >
        Stream View
      </button>

      {/* Recording Toggle */}
      <button onClick={onToggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {/* Start Meeting Button */}
      <button onClick={() => setIsMeetingActive(true)}>Start Meeting</button>
    </div>
  );
};

export default MainToolbar;
