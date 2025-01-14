import React from "react";

type MainToolbarProps = {
  excalidrawAPI: any;
  onToggleWebcam: () => void; // Toggles webcam feed on/off
  onUploadPDF: () => void; // Handles PDF uploads
  setIsStreamMode: React.Dispatch<React.SetStateAction<boolean>>; // Activates Stream Mode
  setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>; // Sets the webcam feed state
  webcamOn: boolean; // Current webcam state
  onToggleVideoPlayer: () => void; // Toggles VideoPlayer on/off
  onToggleRecording: () => void; // Toggles recording on/off
  isRecording: boolean; // Current recording state
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  excalidrawAPI,
  onToggleWebcam,
  onUploadPDF,
  setIsStreamMode,
  setWebcamOn,
  webcamOn,
  onToggleVideoPlayer,
  onToggleRecording,
  isRecording,
}) => {
  const handleOpen = () => {
    excalidrawAPI?.resetScene();
  };

  const handleSave = () => {
    const elements = excalidrawAPI?.getSceneElements();
    const appState = excalidrawAPI?.getAppState();
    const scene = JSON.stringify({ elements, appState });
    localStorage.setItem("excalidraw-scene", scene);
    alert("Canvas saved!");
  };

  const handleExportImage = () => {
    excalidrawAPI?.exportToBlob().then((blob: Blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "excalidraw-image.png";
      link.click();
    });
  };

  const handleResetCanvas = () => {
    excalidrawAPI?.updateScene({
      elements: [],
      appState: { ...excalidrawAPI.getAppState(), viewBackgroundColor: "#ffffff" },
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
      <button onClick={handleOpen}>Open</button>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleExportImage}>Export Image</button>
      <button onClick={handleResetCanvas}>Reset</button>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <button onClick={onToggleWebcam}>Toggle Webcam</button>
      <button onClick={handleImageUpload}>Upload Image</button>
      <button onClick={onUploadPDF}>Upload PDF</button>
      <button
        onClick={() => {
          setIsStreamMode(true);
          if (!webcamOn) {
            setWebcamOn(true);
          }
        }}
      >
        Stream View
      </button>
      <button onClick={onToggleVideoPlayer}>Toggle Video Player</button>
      <button onClick={onToggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default MainToolbar;
