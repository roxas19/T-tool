import React from "react";
import ParticipantTile, { Participant } from "./ParticipantTile";
import "./MeetingView.css";
import { DailyCall } from "@daily-co/daily-js";

type MeetingViewProps = {
  participants: Participant[];
  callObjectRef: React.MutableRefObject<DailyCall | null>;
  leaveMeeting: () => void;
  startScreenShare: () => void; // Added from MeetingUI
  stopScreenShare: () => void;  // Added from MeetingUI
};

const MeetingView: React.FC<MeetingViewProps> = ({
  participants,
  callObjectRef,
  leaveMeeting,
  startScreenShare,
  stopScreenShare,
}) => {
  const isScreenSharingActive = participants.some(
    (p) => p.isScreenSharing
  );

  console.log("Participants passed to MeetingView:", participants);
  console.log("Is screen sharing active:", isScreenSharingActive);

  return (
    <div className="meeting-view">
      {/* Participant Grid */}
      <div
        className={`participant-grid ${
          participants.length === 1 ? "single" : ""
        }`}
      >
        {participants.length > 0 ? (
          participants.map((participant) => (
            <ParticipantTile
              key={participant.sessionId} // Use sessionId as the unique key
              participant={participant}
              callObject={callObjectRef.current}
            />
          ))
        ) : (
          <div className="no-participants">No participants in the meeting</div>
        )}
      </div>

      {/* Controls Toolbar */}
      <div className="meeting-controls">
        <button onClick={leaveMeeting}>Leave Meeting</button>
        <button
          onClick={startScreenShare}
          disabled={isScreenSharingActive}
        >
          Start Screen Share
        </button>
        <button
          onClick={stopScreenShare}
          disabled={!isScreenSharingActive}
        >
          Stop Screen Share
        </button>
      </div>
    </div>
  );
};

export default MeetingView;
