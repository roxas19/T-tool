// MinimizedMeetingPanel.tsx
import React from "react";
import { useMediaToggleContext } from "./MediaToggleContext";
import "../css/App.css";

interface MinimizedMeetingPanelProps {
  onMaximize: () => void;
}

const MinimizedMeetingPanel: React.FC<MinimizedMeetingPanelProps> = ({ onMaximize }) => {
  const { isHostAudioOn, isHostVideoOn, toggleAudio, toggleVideo } = useMediaToggleContext();

  return (
    <div className="minimized-panel">
      {/* Maximize Button */}
      <button onClick={onMaximize} className="control-button maximize-button">
        Maximize
      </button>
      {/* Media Controls */}
      <button onClick={toggleAudio} className="control-button">
        {isHostAudioOn ? "Mute Mic" : "Unmute Mic"}
      </button>
      <button onClick={toggleVideo} className="control-button">
        {isHostVideoOn ? "Turn Off Camera" : "Turn On Camera"}
      </button>
    </div>
  );
};

export default MinimizedMeetingPanel;
