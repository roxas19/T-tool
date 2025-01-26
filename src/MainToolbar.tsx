import React from "react";
import { handleStartMeeting, handleStopMeeting } from "./utils/meetingUtils"; // Updated utility functions

type MainToolbarProps = {
  excalidrawAPI: any;
  onToggleWebcam: () => void;
  onUploadPDF: () => void;
  setIsStreamMode: React.Dispatch<React.SetStateAction<boolean>>;
  setWebcamOn: React.Dispatch<React.SetStateAction<boolean>>;
  webcamOn: boolean;
  onToggleVideoPlayer: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  setRoomUrl: React.Dispatch<React.SetStateAction<string | null>>; // Add setRoomUrl to props
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
  setRoomUrl,
}) => {
  const meetingId = "test-meeting-1"; // Replace with a dynamic meeting ID

  const handleStartMeetingClick = () => {
    handleStartMeeting(setRoomUrl, meetingId); // Pass setRoomUrl to capture room URL
  };

  const handleStopMeetingClick = () => {
    handleStopMeeting(setRoomUrl, meetingId); // Pass setRoomUrl for proper cleanup
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
      {/* Separate Start and Stop Meeting Buttons */}
      <button onClick={handleStartMeetingClick}>Start Meeting</button>
      <button onClick={handleStopMeetingClick}>Stop Meeting</button>
    </div>
  );
};

export default MainToolbar;
