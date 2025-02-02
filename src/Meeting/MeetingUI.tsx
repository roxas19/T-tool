// MeetingUI.tsx
import React, { useEffect, useState } from "react";
import {
  useDaily,
  useLocalParticipant,
  DailyVideo,
  useScreenShare,
} from "@daily-co/daily-react";
import { stopMeeting } from "./meetingFunctions";
import { ParticipantList } from "./participantControls";
import "../css/MeetingApp.css"; // Adjust path as needed

export interface MeetingUIProps {
  roomUrl: string;
  onStop: () => void;
  meetingName: string;
}

const MeetingUI: React.FC<MeetingUIProps> = ({ roomUrl, onStop, meetingName }) => {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    if (!daily || !roomUrl) return;
    daily.join({ url: roomUrl }).then(() => {
      daily.setLocalAudio(true);
      daily.setLocalVideo(true);
    });
    return () => {
      daily.leave();
    };
  }, [daily, roomUrl]);

  const handleStopMeeting = async () => {
    if (daily) {
      await daily.leave(); // Leave the Daily meeting
    }
    await stopMeeting(meetingName); // Use the passed meetingName
    onStop();
  };

  return (
    <div className="meeting-container">
      <div className="video-grid">
        {isSharingScreen ? (
          <div className="video-tile screen-share-tile">
            <DailyVideo
              sessionId={localParticipant?.session_id || ""}
              type="screenVideo"
              autoPlay
            />
          </div>
        ) : (
          <div className="video-tile">
            {localParticipant?.session_id ? (
              <DailyVideo
                sessionId={localParticipant.session_id || ""}
                type="video"
                autoPlay
                muted
              />
            ) : (
              <div className="no-video">No Host Video</div>
            )}
          </div>
        )}
      </div>

      <div className="control-panel">
        <button onClick={handleStopMeeting} className="control-button stop-button">
          Stop Meeting
        </button>
        <button
          onClick={() => (isSharingScreen ? stopScreenShare() : startScreenShare())}
          className="control-button share-button"
        >
          {isSharingScreen ? "Stop Sharing" : "Share Screen"}
        </button>
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="control-button"
        >
          {showParticipants ? "Hide Participants" : "Show Participants"}
        </button>
      </div>

      {showParticipants && <ParticipantList />}
    </div>
  );
};

export default MeetingUI;
