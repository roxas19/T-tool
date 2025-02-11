// MeetingControls.tsx
import React from "react";
import { useMediaToggleContext } from "./MediaToggleContext";
import "../css/MeetingApp.css";

interface MeetingControlsProps {
  onStopMeeting: () => void;
  isSharingScreen: boolean;
  onToggleShare: () => void;
  showParticipants: boolean;
  onToggleParticipants: () => void;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
  onStopMeeting,
  isSharingScreen,
  onToggleShare,
  showParticipants,
  onToggleParticipants,
}) => {
  const { isHostAudioOn, isHostVideoOn, toggleAudio, toggleVideo } = useMediaToggleContext();

  return (
    <div className="control-panel">
      <button onClick={onStopMeeting} className="control-button stop-button">
        Stop Meeting
      </button>
      <button onClick={onToggleShare} className="control-button share-button">
        {isSharingScreen ? "Stop Sharing" : "Share Screen"}
      </button>
      <button onClick={onToggleParticipants} className="control-button">
        {showParticipants ? "Hide Participants" : "Show Participants"}
      </button>
      <button onClick={toggleAudio} className="control-button">
        {isHostAudioOn ? "Mute Mic" : "Unmute Mic"}
      </button>
      <button onClick={toggleVideo} className="control-button">
        {isHostVideoOn ? "Turn Off Camera" : "Turn On Camera"}
      </button>
    </div>
  );
};

export default MeetingControls;
