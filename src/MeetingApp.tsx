import React from "react";
import { DailyProvider } from "@daily-co/daily-react";
import { startMeeting, stopMeeting } from "./Meeting/meetingFunctions";
import MeetingUI from "./Meeting/MeetingUI";
import { useOverlayManager } from "./context/OverlayManagerContext";
import { useMeetingContext } from "./context/MeetingContext";
import ModalOverlay from "./utils/ModalOverlay";
import "./css/MeetingApp.css";
import "./css/ModalOverlay.css";

const MeetingApp: React.FC = () => {
  const { overlayState, overlayDispatch } = useOverlayManager();
  const { meetingState, meetingDispatch } = useMeetingContext();
  const meetingZIndex = overlayState.overlayZIndices.overlay;

  const handleStartMeeting = async () => {
    const meetingName = meetingState.meetingName;
    const url = await startMeeting(meetingName);
    if (url) {
      // Open the meeting and set meeting details (name and room URL)
      meetingDispatch({ type: "OPEN_MEETING" });
      meetingDispatch({
        type: "SET_MEETING_DETAILS",
        payload: { meetingName, roomUrl: url },
      });
      overlayDispatch({ type: "PUSH_OVERLAY", payload: "meeting" });
    } else {
      alert("Failed to start the meeting.");
    }
  };

  const handleClosePreMeeting = () => {
    meetingDispatch({ type: "CLOSE_MEETING" });
    overlayDispatch({ type: "POP_OVERLAY" });
  };

  const handleStopMeeting = async () => {
    try {
      await stopMeeting(meetingState.meetingName);
    } catch (error) {
      console.error("Error stopping meeting:", error);
    }
    meetingDispatch({ type: "CLOSE_MEETING" });
    overlayDispatch({ type: "POP_OVERLAY" });
  };

  if (!meetingState.roomUrl) {
    return (
      <ModalOverlay
        isVisible={meetingState.isActive}
        zIndex={meetingZIndex}
        onClose={handleClosePreMeeting}
      >
        <h2>Enter Meeting Name</h2>
        <input
          type="text"
          placeholder="Meeting Title"
          value={meetingState.meetingName}
          onChange={(e) =>
            meetingDispatch({ type: "SET_MEETING_NAME", payload: e.target.value })
          }
        />
        <button onClick={handleStartMeeting}>Start Meeting</button>
      </ModalOverlay>
    );
  }

  return (
    <DailyProvider>
      <>
        {/* Removed HeaderPanel with minimize/exit buttons */}
        <MeetingUI
          roomUrl={meetingState.roomUrl!}
          onStop={handleStopMeeting}
          meetingName={meetingState.meetingName}
        />
      </>
    </DailyProvider>
  );
};

// Custom hook to expose meeting control logic (stop meeting)
export const useMeetingControls = () => {
  const { meetingState, meetingDispatch } = useMeetingContext();
  const { overlayDispatch } = useOverlayManager();

  const handleStopMeeting = async () => {
    try {
      await stopMeeting(meetingState.meetingName);
    } catch (error) {
      console.error("Error stopping meeting:", error);
    }
    meetingDispatch({ type: "CLOSE_MEETING" });
    overlayDispatch({ type: "POP_OVERLAY" });
  };

  return { handleStopMeeting };
};

export default MeetingApp;