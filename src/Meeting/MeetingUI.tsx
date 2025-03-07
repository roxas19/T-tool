// MeetingUI.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  useDaily,
  useLocalSessionId, // Updated hook
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
  const localSessionId = useLocalSessionId(); // Using new hook which returns a string
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();

  // Global permission state: maps participantId to granted permissions.
  const [grantedPermissions, setGrantedPermissions] = useState<{
    [id: string]: ParticipantPermission;
  }>({});

  const [showParticipants, setShowParticipants] = useState(false);
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);

  // Memoize granted participant IDs.
  const grantedParticipantIds = useMemo(
    () =>
      Object.keys(grantedPermissions).filter(
        (id) => grantedPermissions[id].audio || grantedPermissions[id].video
      ),
    [grantedPermissions]
  );

  // Memoize active participants: host first, then include up to three granted participants.
  const activeParticipants = useMemo(() => {
    return localSessionId
      ? [localSessionId, ...grantedParticipantIds].slice(0, 4)
      : grantedParticipantIds.slice(0, 4);
  }, [localSessionId, grantedParticipantIds]);

  // Join meeting and enable local audio/video with cleanup.
  useEffect(() => {
    if (!daily || !roomUrl) return;
    let cancelled = false;
    daily
      .join({ url: roomUrl })
      .then(() => {
        if (!cancelled) {
          daily.setLocalAudio(true);
          daily.setLocalVideo(true);
        }
      })
      .catch((error) => {
        console.error("Failed to join meeting:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [daily, roomUrl]);

  const handleStopMeeting = async () => {
    if (daily) {
      try {
        await daily.leave();
      } catch (error) {
        console.error("Error leaving meeting:", error);
      }
    }
    try {
      await stopMeeting(meetingName);
    } catch (error) {
      console.error("Error stopping meeting:", error);
    }
    onStop();
  };

  // Callback to update permissions from ParticipantList.
  const handlePermissionChange = (
    participantId: string,
    permission: ParticipantPermission
  ) => {
    const isAlreadyGranted = Object.prototype.hasOwnProperty.call(grantedPermissions, participantId);
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

  // Render function for a video tile.
  const renderTile = (participantId: string) => {
    const isLocal = participantId === localSessionId;
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
        <ActiveVideoGrid activeParticipants={activeParticipants} renderTile={renderTile} />
      </div>

      {/* Meeting Controls */}
      <MeetingControls
        onStopMeeting={handleStopMeeting}
        isSharingScreen={isSharingScreen}
        onToggleShare={() =>
          isSharingScreen ? stopScreenShare() : startScreenShare()
        }
        showParticipants={showParticipants}
        onToggleParticipants={() => setShowParticipants((prev) => !prev)}
      />

      {/* Participant List */}
      {showParticipants && (
        <ParticipantList
          onPermissionChange={handlePermissionChange}
          grantedPermissions={grantedPermissions}
        />
      )}

      {/* Expanded Video Overlay */}
      {expandedParticipantId && (
        <div className="expanded-video-overlay">
          <div className="participant-grid one-tile">
            <div className="grid-slot">
              <DailyVideo
                sessionId={expandedParticipantId}
                type={
                  isSharingScreen && expandedParticipantId === localSessionId
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
