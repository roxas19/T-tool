// MeetingControls.tsx
import React, { useState } from "react";
import { useDaily } from "@daily-co/daily-react";
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
  // Use Daily's hook to access the Daily instance
  const daily = useDaily();
  // Local state for host's own media (audio/mic and video/webcam)
  const [isHostAudioOn, setIsHostAudioOn] = useState(true);
  const [isHostVideoOn, setIsHostVideoOn] = useState(true);

  const handleToggleHostAudio = () => {
    const newAudioState = !isHostAudioOn;
    setIsHostAudioOn(newAudioState);
    if (daily) {
      daily.setLocalAudio(newAudioState);
    }
  };

  const handleToggleHostVideo = () => {
    const newVideoState = !isHostVideoOn;
    setIsHostVideoOn(newVideoState);
    if (daily) {
      daily.setLocalVideo(newVideoState);
    }
  };

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
      <button onClick={handleToggleHostAudio} className="control-button">
        {isHostAudioOn ? "Mute Mic" : "Unmute Mic"}
      </button>
      <button onClick={handleToggleHostVideo} className="control-button">
        {isHostVideoOn ? "Turn Off Camera" : "Turn On Camera"}
      </button>
    </div>
  );
};

export default MeetingControls;
