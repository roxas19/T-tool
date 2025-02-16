import React from "react";

type MainToolbarProps = {
  excalidrawAPI: any;
  setIsStreamMode: React.Dispatch<React.SetStateAction<boolean>>;
  setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>;
  webcamOn: boolean;
  onToggleWebcam: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  setIsMeetingActive: React.Dispatch<React.SetStateAction<boolean>>;
  // New prop for PDF upload callback
  onPdfUpload: (file: File) => void;
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  excalidrawAPI,
  setIsStreamMode,
  setWebcamOn,
  onToggleWebcam,
  onToggleRecording,
  isRecording,
  setIsMeetingActive,
  onPdfUpload,
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

  // PDF file input handler
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
      // Clear the input value so that the same file can be re-uploaded if needed
      e.target.value = "";
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
          display: "inline-block"
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
