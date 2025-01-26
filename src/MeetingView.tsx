import React from "react";
import "./MeetingView.css";

type MeetingViewProps = {
  participants: {
    id: string;
    name: string;
    isScreenSharing: boolean;
    isWebcamOn: boolean;
    isMicOn: boolean;
  }[];
  callObjectRef: React.MutableRefObject<any>;
  leaveMeeting: () => void;
};

const MeetingView: React.FC<MeetingViewProps> = ({
  participants,
  callObjectRef,
  leaveMeeting,
}) => {
  return (
    <div className="meeting-view">
      <div className="participant-grid">{renderGrid()}</div>
      <div className="controls">
        <button onClick={leaveMeeting}>Leave Meeting</button>
      </div>
    </div>
  );

  function renderGrid() {
    const gridSlots = [...Array(4)].map((_, index) => {
      const participant = participants[index];
      if (participant) {
        return (
          <div key={participant.id} className="grid-slot">
            {participant.isScreenSharing ? (
              <div className="screen-share">Screen Sharing</div>
            ) : participant.isWebcamOn ? (
              <video autoPlay playsInline></video>
            ) : participant.isMicOn ? (
              <div className="audio-indicator">Audio On</div>
            ) : (
              <div className="placeholder">Participant</div>
            )}
          </div>
        );
      } else {
        return (
          <div key={index} className="grid-slot placeholder">
            Empty Slot
          </div>
        );
      }
    });

    return <div className="grid-container">{gridSlots}</div>;
  }
};

export default MeetingView;
