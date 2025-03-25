import React, { useState } from "react";
import { DailyProvider } from "@daily-co/daily-react";
import { startMeeting, stopMeeting } from "./Meeting/meetingFunctions";
import MeetingUI from "./Meeting/MeetingUI";
import { useOverlayManager } from "./context/OverlayManagerContext";
import { useMeetingContext } from "./context/MeetingContext";
import ModalOverlay from "./utils/ModalOverlay";
import HeaderPanel from "./utils/HeaderPanel";

// Import SVG icons
import MinimiseIcon from "./icons/minimise.svg";
import ExitIcon from "./icons/exit.svg";
import "./css/MeetingApp.css";

const MeetingApp: React.FC = () => {
  const [meetingName, setMeetingName] = useState("default-meeting");
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  const { overlayState, overlayDispatch } = useOverlayManager();
  const { meetingState, meetingDispatch } = useMeetingContext();
  const meetingZIndex = overlayState.overlayZIndices.overlay;

  const handleStartMeeting = async () => {
    const url = await startMeeting(meetingName);
    if (url) {
      setRoomUrl(url);
      meetingDispatch({ type: "OPEN_MEETING" });
      overlayDispatch({ type: "PUSH_OVERLAY", payload: "meeting" });
    } else {
      alert("Failed to start the meeting.");
    }
  };

  const handleMinimize = () => {
    if (overlayState.activeStack.length > 1) {
      overlayDispatch({ type: "POP_OVERLAY" });
    }
    meetingDispatch({ type: "SET_MINIMIZED", payload: true });
  };

  const handleRestore = () => {
    meetingDispatch({ type: "SET_MINIMIZED", payload: false });
  };

  const handleStopMeeting = async () => {
    try {
      await stopMeeting(meetingName);
    } catch (error) {
      console.error("Error stopping meeting:", error);
    }
    setRoomUrl(null);
    meetingDispatch({ type: "CLOSE_MEETING" });
    overlayDispatch({ type: "POP_OVERLAY" });
  };

  if (!roomUrl) {
    return (
      <ModalOverlay isVisible={true} zIndex={meetingZIndex}>
        <h2>Enter Meeting Name</h2>
        <input
          type="text"
          placeholder="Meeting Name"
          value={meetingName}
          onChange={(e) => setMeetingName(e.target.value)}
        />
        <button onClick={handleStartMeeting}>Start Meeting</button>
      </ModalOverlay>
    );
  }

  return (
    <DailyProvider>
      <>
        <HeaderPanel
          leftContent={
            meetingState.isMinimized ? (
              <img
                src={MinimiseIcon}
                alt="Restore"
                onClick={handleRestore}
                className="header-panel-icon"
              />
            ) : (
              <img
                src={MinimiseIcon}
                alt="Minimize"
                onClick={handleMinimize}
                className="header-panel-icon"
              />
            )
          }
          rightContent={
            <img
              src={ExitIcon}
              alt="Close Meeting"
              onClick={handleStopMeeting}
              className="header-panel-icon"
            />
          }
        />
        <MeetingUI roomUrl={roomUrl} onStop={handleStopMeeting} meetingName={meetingName} />
      </>
    </DailyProvider>
  );
};

export default MeetingApp;