// MeetingApp.tsx
import React, { useState } from "react";
import { DailyProvider } from "@daily-co/daily-react";
import { startMeeting } from "./Meeting/meetingFunctions";
import MeetingUI from "./Meeting/MeetingUI"; // Import the updated MeetingUI component
import "./css/MeetingApp.css";

interface MeetingAppProps {
  isMeetingMinimized: boolean;
  onMeetingStart: () => void;
  onClose: () => void;
}

const MeetingApp: React.FC<MeetingAppProps> = ({
  isMeetingMinimized,
  onMeetingStart,
  onClose,
}) => {
  const [meetingName, setMeetingName] = useState("default-meeting");
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  const handleStartMeeting = async () => {
    const url = await startMeeting(meetingName);
    if (url) {
      setRoomUrl(url);
      onMeetingStart(); // Notify parent that meeting started
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

  // Render ongoing meeting UI without an extra wrapper.
  return (
    <DailyProvider>
      <MeetingUI roomUrl={roomUrl} onStop={onClose} meetingName={meetingName} />
    </DailyProvider>
  );
};

export default MeetingApp;
