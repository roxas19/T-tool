import React, { useState } from "react";
import "../css/RecordButton.css";

type RecordButtonProps = {
  isRecording: boolean;
  onToggleRecording: () => void;
  onDownloadLast15: () => void;
};

const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  onToggleRecording,
  onDownloadLast15,
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`record-button-container ${hover ? "recording-hover" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        className={`record-button ${isRecording ? "active" : ""}`}
        onClick={onToggleRecording}
      >
        {isRecording ? (hover ? "Stop Recording" : "Recording") : "Start Recording"}
      </button>
      {isRecording && (
        <div className="record-dropdown">
          <button onClick={onDownloadLast15} className="dropdown-btn">
            Download Last 15 Minutes
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordButton;
