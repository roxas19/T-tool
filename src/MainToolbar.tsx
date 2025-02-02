import React from "react";

type MainToolbarProps = {
  excalidrawAPI: any;
  setIsStreamMode: React.Dispatch<React.SetStateAction<boolean>>;
  setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>;
  webcamOn: boolean;
  onToggleWebcam: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  setIsMeetingActive: React.Dispatch<React.SetStateAction<boolean>>; // Added prop for meeting toggle
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  excalidrawAPI,
  setIsStreamMode,
  setWebcamOn,
  onToggleWebcam,
  onToggleRecording,
  isRecording,
  setIsMeetingActive, // New prop
}) => {
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

  return (
    <div className="main-toolbar">
      <button onClick={handleResetCanvas}>Reset</button>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <button onClick={handleImageUpload}>Upload Image</button>

      {/* Webcam Toggle */}
      <button onClick={onToggleWebcam}>Toggle Webcam</button>

      {/* Stream View (Enables Stream Mode and Webcam) */}
      <button
        onClick={() => {
          setIsStreamMode(true);
          setWebcamOn(true);
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
