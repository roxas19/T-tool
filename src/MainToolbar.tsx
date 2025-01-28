import React from "react";
import { handleStartMeeting, handleStopMeeting } from "./utils/meetingUtils";

type MainToolbarProps = {
  excalidrawAPI: any;
  setIsStreamMode: React.Dispatch<React.SetStateAction<boolean>>;
  setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>;
  webcamOn: boolean;
  onToggleWebcam: () => void; // Restored webcam toggle function
  onToggleRecording: () => void;
  isRecording: boolean;
  setRoomUrl: React.Dispatch<React.SetStateAction<string | null>>;
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  excalidrawAPI,
  setIsStreamMode,
  setWebcamOn,
  onToggleWebcam,
  onToggleRecording,
  isRecording,
  setRoomUrl,
}) => {
  const meetingId = "test-meeting-1"; // Replace with a dynamic meeting ID

  const handleStartMeetingClick = () => {
    handleStartMeeting(setRoomUrl, meetingId);
  };

  const handleStopMeetingClick = () => {
    handleStopMeeting(setRoomUrl, meetingId);
  };

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

      {/* Meeting Management */}
      <button onClick={handleStartMeetingClick}>Start Meeting</button>
      <button onClick={handleStopMeetingClick}>Stop Meeting</button>
    </div>
  );
};

export default MainToolbar;
