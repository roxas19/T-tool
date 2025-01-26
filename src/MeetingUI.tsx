import React, { useEffect, useRef, useState } from "react";
import "./MeetingUI.css";
import DailyIframe, {
  DailyCall,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
} from "@daily-co/daily-js";
import MeetingView from "./MeetingView"; // New fullscreen component

type Participant = {
  id: string;
  name: string;
  isScreenSharing: boolean;
  isWebcamOn: boolean;
  isMicOn: boolean;
};

type MeetingUIProps = {
  roomUrl: string | null; // Room URL passed from parent
  onMeetingEnd: () => void; // Callback when the meeting ends
};

const MeetingUI: React.FC<MeetingUIProps> = ({ roomUrl, onMeetingEnd }) => {
  const callObjectRef = useRef<DailyCall | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMeetingActive, setIsMeetingActive] = useState(false);

  // Join the meeting and set up listeners
  useEffect(() => {
    if (!roomUrl) {
      console.warn("No room URL provided. Skipping meeting initialization.");
      return ;
    }

    console.log("Joining meeting with room URL:", roomUrl);

    const callObject = DailyIframe.createCallObject();
    callObjectRef.current = callObject;

    callObject
      .join({ url: roomUrl })
      .then(() => {
        console.log("Meeting joined successfully.");
        setIsMeetingActive(true);
      })
      .catch((error) => {
        console.error("Failed to join the meeting:", error);
        callObjectRef.current = null;
      });

    callObject.on("participant-updated", handleParticipantUpdated);
    callObject.on("participant-left", handleParticipantLeft);

    return () => {
      console.log("Cleaning up DailyIframe instance.");
      if (callObjectRef.current) {
        callObjectRef.current.leave();
        callObjectRef.current.destroy();
        callObjectRef.current = null;
        console.log("DailyIframe instance destroyed.");
      }
      // Explicitly reset all states
      setParticipants([]);
      setIsMeetingActive(false);
      onMeetingEnd(); // Notify parent
    };
  }, [roomUrl, onMeetingEnd]);

  const handleParticipantUpdated = (event: DailyEventObjectParticipant) => {
    const updatedParticipant = event.participant;
    setParticipants((prev) => {
      const existingParticipantIndex = prev.findIndex(
        (p) => p.id === updatedParticipant.user_id
      );
      if (existingParticipantIndex !== -1) {
        const updatedParticipants = [...prev];
        updatedParticipants[existingParticipantIndex] = {
          id: updatedParticipant.user_id,
          name: updatedParticipant.user_name || "Guest",
          isScreenSharing: !!updatedParticipant.screen,
          isWebcamOn: !!updatedParticipant.video,
          isMicOn: !!updatedParticipant.audio,
        };
        return updatedParticipants;
      } else {
        return [
          ...prev,
          {
            id: updatedParticipant.user_id,
            name: updatedParticipant.user_name || "Guest",
            isScreenSharing: !!updatedParticipant.screen,
            isWebcamOn: !!updatedParticipant.video,
            isMicOn: !!updatedParticipant.audio,
          },
        ];
      }
    });
  };

  const handleParticipantLeft = (event: DailyEventObjectParticipantLeft) => {
    const leftParticipantId = event.participant.user_id;
    setParticipants((prev) =>
      prev.filter((participant) => participant.id !== leftParticipantId)
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

  // Only render MeetingView if the meeting is active
  if (!isMeetingActive) return null;

  return (
    <MeetingView
      participants={participants}
      callObjectRef={callObjectRef}
      leaveMeeting={leaveMeeting}
    />
  );
};

export default MeetingUI;
