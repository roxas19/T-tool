import React from "react";
import { useParticipantIds, DailyVideo } from "@daily-co/daily-react";
import "./MeetingView.css";

function MeetingView({ leaveMeeting, isScreenSharing, startScreenShare, stopScreenShare }) {
  // Filter only screen-sharing participants
  const screenSharingIds = useParticipantIds({
    filter: "screen",
  });

  return (
    <div className="meeting-view">
      {/* Screen Sharing Participant Grid */}
      <div
        className={`participant-grid ${
          screenSharingIds.length === 1 ? "single" : ""
        }`}
      >
        {screenSharingIds.length > 0 ? (
          screenSharingIds.map((id) => (
            <div key={id} className="participant-tile">
              <DailyVideo
                participantId={id}
                autoPlay
                playsInline
                mirror={id === "local"}
              />
            </div>
          ))
        ) : (
          <div className="no-screen-share">
            No one is sharing their screen currently.
          </div>
        )}
      </div>

      {/* Controls Toolbar */}
      <div className="meeting-controls">
        <button onClick={leaveMeeting}>Leave Meeting</button>
        {!isScreenSharing ? (
          <button onClick={startScreenShare}>Start Screen Share</button>
        ) : (
          <button onClick={stopScreenShare}>Stop Screen Share</button>
        )}
      </div>
    </div>
  );
}

export default MeetingView;
