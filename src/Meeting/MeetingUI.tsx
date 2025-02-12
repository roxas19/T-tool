// MeetingUI.tsx
import React, { useEffect, useState } from "react";
import {
  useDaily,
  useLocalParticipant,
  DailyVideo,
  useScreenShare,
} from "@daily-co/daily-react";
import { stopMeeting } from "./meetingFunctions";
import { ParticipantList, ParticipantPermission } from "./participantControls";
import MeetingControls from "./MeetingControls";
import ActiveVideoGrid from "./ActiveVideoGrid";
import "../css/MeetingApp.css"; // Adjust path as needed

export interface MeetingUIProps {
  roomUrl: string;
  onStop: () => void;
  meetingName: string;
}

const MeetingUI: React.FC<MeetingUIProps> = ({ roomUrl, onStop, meetingName }) => {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();

  // Global permission state: maps participantId to granted permissions.
  const [grantedPermissions, setGrantedPermissions] = useState<{
    [id: string]: ParticipantPermission;
  }>({});

  const [showParticipants, setShowParticipants] = useState(false);

  // New state to track which video tile is expanded (clicked)
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);

  // Derive granted participant IDs (those with either audio or video granted).
  const grantedParticipantIds = Object.keys(grantedPermissions).filter(
    (id) => grantedPermissions[id].audio || grantedPermissions[id].video
  );

  // Active grid: always include the host's session ID first,
  // then include up to three granted participant IDs.
  const activeParticipants = localParticipant
    ? [localParticipant.session_id, ...grantedParticipantIds].slice(0, 4)
    : grantedParticipantIds.slice(0, 4);

  // Join meeting and enable local audio/video.
  useEffect(() => {
    if (!daily || !roomUrl) return;
    daily.join({ url: roomUrl }).then(() => {
      daily.setLocalAudio(true);
      daily.setLocalVideo(true);
    });
    // No automatic cleanup here; meeting stops only via the explicit Stop Meeting button.
  }, [daily, roomUrl]);

  const handleStopMeeting = async () => {
    if (daily) {
      await daily.leave();
    }
    await stopMeeting(meetingName);
    onStop();
  };

  // Callback to update permissions from ParticipantList.
  // Enforces that only up to 3 non-host participants can have permissions.
  const handlePermissionChange = (
    participantId: string,
    permission: ParticipantPermission
  ) => {
    const isAlreadyGranted = grantedPermissions.hasOwnProperty(participantId);
    const currentGrantedCount = Object.keys(grantedPermissions).filter(
      (id) => grantedPermissions[id].audio || grantedPermissions[id].video
    ).length;

    if (!isAlreadyGranted && currentGrantedCount >= 3) {
      return;
    }

    setGrantedPermissions((prev) => ({
      ...prev,
      [participantId]: permission,
    }));

    if (daily) {
      daily.sendAppMessage(
        {
          type: "PERMISSION_UPDATE",
          participantId,
          audio: permission.audio,
          video: permission.video,
        },
        "*" // Broadcast to all participants.
      );
    }
  };

  // Render function to generate a video tile for a given participant ID.
  // The tile is wrapped in an onClick handler to trigger expansion.
  const renderTile = (participantId: string, index: number) => {
    const isLocal = participantId === localParticipant?.session_id;
    const tileClass =
      isSharingScreen && isLocal ? "grid-slot screen-share-adjust" : "grid-slot";
    return (
      <div
        key={participantId}
        className={tileClass}
        onClick={() => setExpandedParticipantId(participantId)}
        style={{ cursor: "pointer" }}
      >
        <DailyVideo
          sessionId={participantId}
          type={isSharingScreen && isLocal ? "screenVideo" : "video"}
          autoPlay
          muted={isLocal} // Mute local video to prevent echo.
        />
      </div>
    );
  };

  return (
    <div className="meeting-content">
      {/* Video Grid Container */}
      <div className="video-grid-container">
        <ActiveVideoGrid
          activeParticipants={activeParticipants}
          renderTile={renderTile}
        />
      </div>

      {/* Meeting Controls */}
      <MeetingControls
        onStopMeeting={handleStopMeeting}
        isSharingScreen={isSharingScreen}
        onToggleShare={() =>
          isSharingScreen ? stopScreenShare() : startScreenShare()
        }
        showParticipants={showParticipants}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
      />

      {/* Participant List (if toggled) */}
      {showParticipants && (
        <ParticipantList
          onPermissionChange={handlePermissionChange}
          grantedPermissions={grantedPermissions}
        />
      )}

      {/* Expanded Video Overlay */}
      {expandedParticipantId && (
        <div className="expanded-video-overlay">
          {/* Reuse the one-tile grid structure to mimic the single-participant layout */}
          <div className="participant-grid one-tile">
            <div className="grid-slot">
              <DailyVideo
                sessionId={expandedParticipantId}
                type={
                  isSharingScreen && expandedParticipantId === localParticipant?.session_id
                    ? "screenVideo"
                    : "video"
                }
                autoPlay
                muted={false}
              />
            </div>
          </div>
          <button
            className="close-button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedParticipantId(null);
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingUI;
