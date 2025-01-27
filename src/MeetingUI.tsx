import React, { useEffect, useRef, useState } from "react";
import "./MeetingUI.css";
import DailyIframe, {
  DailyCall,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
} from "@daily-co/daily-js";
import MeetingView from "./MeetingView";
import { Participant } from "./ParticipantTile";

type MeetingUIProps = {
  roomUrl: string | null;
  onMeetingEnd: () => void;
};

const MeetingUI: React.FC<MeetingUIProps> = ({ roomUrl, onMeetingEnd }) => {
  const callObjectRef = useRef<DailyCall | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMeetingActive, setIsMeetingActive] = useState(false);

  useEffect(() => {
    if (!roomUrl) {
      console.warn("No room URL provided. Skipping meeting initialization.");
      return;
    }

    console.log("Joining meeting with room URL:", roomUrl);

    const callObject = DailyIframe.createCallObject();
    callObjectRef.current = callObject;

    // Attempt to join
    callObject
      .join({
        url: roomUrl,
        videoSource: false, // Disable webcam for screen-only sharing
        audioSource: true, // Enable microphone if needed
      })
      .then(() => {
        console.log(
          "Meeting joined successfully. Room configuration:",
          callObject.participants()
        );
        setIsMeetingActive(true);
      })
      .catch((error) => {
        console.error("Failed to join the meeting:", error);
        callObjectRef.current = null;
      });

    // Register Daily events
    callObject.on("participant-updated", handleParticipantUpdated);
    callObject.on("participant-left", handleParticipantLeft);

    // Cleanup on unmount
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave();
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
      setParticipants([]);
      setIsMeetingActive(false);
      onMeetingEnd();
    };
  }, [roomUrl, onMeetingEnd]);

  const handleParticipantUpdated = (event: DailyEventObjectParticipant) => {
    const updatedParticipant = event.participant;
    console.log("Participant updated:", updatedParticipant);

    setParticipants((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.sessionId === updatedParticipant.session_id
      );

      const updatedData: Participant = {
        sessionId: updatedParticipant.session_id, // Use session_id for reliable lookups
        userId: updatedParticipant.user_id, // Optionally store user_id
        name: updatedParticipant.user_name || "Guest",
        isScreenSharing:
          updatedParticipant.tracks.screenVideo?.state === "playable",
        isWebcamOn: updatedParticipant.tracks.video?.state === "playable",
        isMicOn: updatedParticipant.tracks.audio?.state === "playable",
      };

      if (existingIndex !== -1) {
        const updatedParticipants = [...prev];
        updatedParticipants[existingIndex] = updatedData;
        return updatedParticipants;
      } else {
        return [...prev, updatedData];
      }
    });
  };

  const handleParticipantLeft = (event: DailyEventObjectParticipantLeft) => {
    const leftParticipantId = event.participant.session_id;
    setParticipants((prev) =>
      prev.filter((p) => p.sessionId !== leftParticipantId)
    );
  };

  const leaveMeeting = () => {
    console.log("Leaving meeting...");
    if (callObjectRef.current) {
      callObjectRef.current.leave();
      callObjectRef.current.destroy();
      callObjectRef.current = null;
    }
    setParticipants([]);
    setIsMeetingActive(false);
    onMeetingEnd();
  };

  // Start screen sharing
  const startScreenShare = () => {
    try {
      callObjectRef.current?.startScreenShare();
      console.log("Screen sharing started");
    } catch (err) {
      console.error("Error starting screen sharing:", err);
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    try {
      callObjectRef.current?.stopScreenShare();
      console.log("Screen sharing stopped");
    } catch (err) {
      console.error("Error stopping screen sharing:", err);
    }
  };

  // Debugging: Check participant states
  useEffect(() => {
    console.log("Current participants:", participants);
  }, [participants]);

  if (!isMeetingActive) return null;

  return (
    <MeetingView
      participants={participants}
      callObjectRef={callObjectRef}
      leaveMeeting={leaveMeeting}
      startScreenShare={startScreenShare} // Pass screen-sharing controls
      stopScreenShare={stopScreenShare} // Pass screen-sharing controls
    />
  );
};

export default MeetingUI;
