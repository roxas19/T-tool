// MeetingApp.tsx
import React, { useState } from "react";
import { DailyProvider } from "@daily-co/daily-react";
import { startMeeting } from "./Meeting/meetingFunctions";
import MeetingUI from "./Meeting/MeetingUI"; // Updated MeetingUI component
import "./css/MeetingApp.css";

interface MeetingAppProps {
  // The minimized state is now derived externally (via the overlay manager)
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
      onMeetingStart(); // Notify parent that meeting started.
    } else {
      alert("Failed to start the meeting.");
    }
  };

  // If there is no room URL, render the setup modal.
  // The modal is hidden when isMeetingMinimized is true.
  if (!roomUrl) {
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

  // Once the meeting has started, render the meeting UI.
  // The meeting UI will also be controlled externally by the overlay manager.
  return (
    <DailyProvider>
      <MeetingUI roomUrl={roomUrl} onStop={onClose} meetingName={meetingName} />
    </DailyProvider>
  );
};

export default MeetingApp;
