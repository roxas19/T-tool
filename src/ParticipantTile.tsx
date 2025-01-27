import React, { useEffect, useRef } from "react";
import { DailyCall } from "@daily-co/daily-js";
import "./ParticipantTile.css";

/**
 * Participant interface to define participant properties.
 */
export interface Participant {
  sessionId: string; // Updated to use sessionId for Daily lookups
  userId?: string; // Optional userId for display or custom purposes
  name: string;
  isScreenSharing: boolean;
  isWebcamOn: boolean;
  isMicOn: boolean;
}

type ParticipantTileProps = {
  participant: Participant;
  callObject: DailyCall | null;
};

const ParticipantTile: React.FC<ParticipantTileProps> = ({
  participant,
  callObject,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!callObject || !videoRef.current) return;

    const dailyParticipant = callObject.participants()[participant.sessionId]; // Use sessionId for lookups

    if (!dailyParticipant) {
      console.warn(
        `Participant ${participant.name} not found in Daily participants`
      );
      videoRef.current.srcObject = null;
      return;
    }

    const screenTrack = dailyParticipant.tracks.screenVideo;
    const cameraTrack = dailyParticipant.tracks.video;

    let selectedTrack = null;

    // Prioritize screen sharing if active and track is playable
    if (participant.isScreenSharing && screenTrack?.state === "playable") {
      selectedTrack = screenTrack.track;
      console.log(`Attaching screen share track for ${participant.name}`);
    } else if (participant.isWebcamOn && cameraTrack?.state === "playable") {
      // Otherwise, fallback to webcam
      selectedTrack = cameraTrack.track;
      console.log(`Attaching webcam track for ${participant.name}`);
    }

    if (selectedTrack) {
      // Attach selected track to the video element
      videoRef.current.srcObject = new MediaStream([selectedTrack]);
    } else {
      console.warn(`No playable track available for ${participant.name}`);
      videoRef.current.srcObject = null;
    }

    return () => {
      // Clean up video element on component unmount
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [
    callObject,
    participant.sessionId, // Changed dependency to sessionId
    participant.isScreenSharing,
    participant.isWebcamOn,
  ]);

  const isLocalParticipant =
    callObject?.participants()?.local?.session_id === participant.sessionId; // Use sessionId for local participant check

  return (
    <div className={`participant-tile ${isLocalParticipant ? "local" : ""}`}>
      {participant.isWebcamOn || participant.isScreenSharing ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocalParticipant} // Mute local participant to avoid echo
        />
      ) : (
        <div className="placeholder">
          {isLocalParticipant
            ? "You (Host) - No Video or Screen Sharing"
            : `${participant.name || "Guest"} - No Video or Screen Sharing`}
        </div>
      )}
      <div className="participant-info">
        <span className="participant-name">
          {isLocalParticipant ? "You (Host)" : participant.name}
        </span>
        {!participant.isMicOn && <span className="muted-indicator">Muted</span>}
      </div>
    </div>
  );
};

export default ParticipantTile;
