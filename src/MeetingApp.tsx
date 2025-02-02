import React, { useEffect, useState } from "react";
import {
  DailyProvider,
  useDaily,
  useLocalParticipant,
  DailyVideo,
  useScreenShare,
  useParticipantIds,
  useParticipant,
} from "@daily-co/daily-react";
import "./css/MeetingApp.css";

const startMeeting = async (meetingName: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/dailyco/${meetingName}/start/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await response.json();
    return response.ok ? data.room_url : null;
  } catch {
    return null;
  }
};

const stopMeeting = async (meetingName: string) => {
  try {
    await fetch(`http://localhost:8000/api/dailyco/${meetingName}/stop/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {}
};

interface MeetingAppProps {
  isMeetingMinimized: boolean;
  onMeetingStart: () => void;
  onClose: () => void;
}

const MeetingApp: React.FC<MeetingAppProps> = ({ isMeetingMinimized, onMeetingStart, onClose }) => {
  const [meetingName, setMeetingName] = useState("default-meeting");
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  const handleStartMeeting = async () => {
    const url = await startMeeting(meetingName);
    if (url) {
      setRoomUrl(url);
      onMeetingStart(); // Notify App.tsx that the meeting has started successfully
    } else {
      alert("Failed to start the meeting.");
    }
  };

  if (!roomUrl) {
    // Render setup modal
    return (
      <div className={`modal ${isMeetingMinimized ? "hidden" : ""}`}>
        <div className="modal-content">
          <h2>Enter Meeting Name</h2>
          <input
            type="text"
            placeholder="Meeting Name"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
          />
          <button onClick={handleStartMeeting}>Start Meeting</button>
        </div>
      </div>
    );
  }

  // Render ongoing meeting UI
  return (
    <DailyProvider>
      <div className={`meeting-container ${isMeetingMinimized ? "hidden" : ""}`}>
        <MeetingUI roomUrl={roomUrl} onStop={onClose} meetingName={meetingName} />
      </div>
    </DailyProvider>
  );
};

const ParticipantItem: React.FC<{ participantId: string }> = ({ participantId }) => {
  const participant = useParticipant(participantId);

  return (
    <li key={participantId}>
      <span>
        {participant?.user_name || "Guest"} {participant?.local && "(You)"}
      </span>
      {participant?.tracks.audio?.state === "off" && <span className="muted">🔇</span>}
      {participant?.tracks.video?.state === "off" && <span className="muted">📷 Off</span>}
      {participant?.screen && <span>🖥️ Sharing Screen</span>}
    </li>
  );
};

const ParticipantList: React.FC = () => {
  const participantIds = useParticipantIds();

  return (
    <div className="participant-list">
      <h3>Participants</h3>
      <ul>
        {participantIds.map((id) => (
          <ParticipantItem key={id} participantId={id} />
        ))}
      </ul>
    </div>
  );
};

interface MeetingUIProps {
  roomUrl: string | null;
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
  
    // Notify the backend that the meeting has ended using the passed meetingName
    await stopMeeting(meetingName);
  
    onStop(); // Properly close and reset the meeting
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

export default MeetingApp;
