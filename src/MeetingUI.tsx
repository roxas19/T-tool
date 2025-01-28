import React, { useEffect } from "react";
import { 
  useDaily, 
  useMeetingState, 
  useScreenShare 
} from "@daily-co/daily-react";
import "./css/MeetingUI.css";
import MeetingView from "./MeetingView";

/**
 * Props:
 * - roomUrl: the Daily room URL (null if meeting not started)
 * - onMeetingEnd: callback triggered when user leaves or meeting ends
 */
type MeetingUIProps = {
  roomUrl: string | null;
  onMeetingEnd: () => void;
};

const MeetingUI: React.FC<MeetingUIProps> = ({ roomUrl, onMeetingEnd }) => {
  const daily = useDaily(); // Access the Daily call object from DailyProvider
  const meetingState = useMeetingState(); // "joined-meeting", "left-meeting", "loading", etc.
  const {
    isSharingScreen,
    startScreenShare,
    stopScreenShare,
  } = useScreenShare({
    onLocalScreenShareStarted: () => console.log("Screen sharing started"),
    onLocalScreenShareStopped: () => console.log("Screen sharing stopped"),
    onError: (error) => console.error("Screen share error:", error),
  });

  /**
   * Join the meeting (if we have a valid roomUrl and aren't already joined).
   * This effect runs whenever `roomUrl` changes.
   */
  useEffect(() => {
    if (!roomUrl) {
      console.warn("No room URL provided. Skipping meeting join.");
      return;
    }
    if (!daily) {
      console.warn("Daily call object not available yet.");
      return;
    }
    if (meetingState === "joined-meeting") {
      // Already in the meeting
      return;
    }

    console.log("Joining meeting with room URL:", roomUrl);

    daily.join({ url: roomUrl }).catch((error) => {
      console.error("Failed to join the meeting:", error);
    });
  }, [roomUrl, daily, meetingState]);

  /**
   * Leaves the meeting explicitly and invokes onMeetingEnd.
   */
  const leaveMeeting = () => {
    if (daily) {
      daily.leave(); // Triggers meetingState to become "left-meeting"
    }
    onMeetingEnd();
  };

  // Hide UI until we've joined or are in the process of joining
  if (!roomUrl || meetingState === "left-meeting") {
    return null;
  }

  // Show a "Loading..." UI while not yet joined
  if (meetingState !== "joined-meeting") {
    return <p className="meeting-status">Joining meeting...</p>;
  }

  // Once we're "joined-meeting", render your main UI
  return (
    <MeetingView
      leaveMeeting={leaveMeeting}
      isScreenSharing={isSharingScreen}
      startScreenShare={() => {
        console.log("Attempting to start screen share...");
        startScreenShare();
      }}
      stopScreenShare={() => {
        console.log("Attempting to stop screen share...");
        stopScreenShare();
      }}
    />
  );
};

export default MeetingUI;
