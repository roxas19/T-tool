// MeetingUI.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  useDaily,
  useLocalSessionId, // Updated hook
  DailyVideo,
  useScreenShare,
} from "@daily-co/daily-react";
import { ParticipantList, ParticipantPermission } from "./participantControls";
import MeetingControls from "./MeetingControls";
import ActiveVideoGrid from "./ActiveVideoGrid";
import { useOverlayManager } from "../context/OverlayManagerContext";
import "../css/MeetingApp.css"; // Adjust path as needed

export interface MeetingUIProps {
  roomUrl: string;
  onStop: () => void;
  meetingName: string;
}

const MeetingUI: React.FC<MeetingUIProps> = ({ roomUrl, onStop, meetingName }) => {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();

  // Retrieve overlay manager state for consistent z-index
  const { overlayState } = useOverlayManager();
  const meetingZIndex = overlayState.overlayZIndices.overlay;

  // Global permission state: maps participantId to granted permissions.
  const [grantedPermissions, setGrantedPermissions] = useState<{ [id: string]: ParticipantPermission }>({});
  const [showParticipants, setShowParticipants] = useState(false);
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);
  // New state: track if the expanded participant tile should be full screen.
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Memoize granted participant IDs.
  const grantedParticipantIds = useMemo(
    () =>
      Object.keys(grantedPermissions).filter(
        (id) => grantedPermissions[id].audio || grantedPermissions[id].video
      ),
    [grantedPermissions]
  );

  // Memoize active participants: host first, then up to three granted participants.
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

  // Callback to update permissions from ParticipantList.
  const handlePermissionChange = (
    participantId: string,
    permission: ParticipantPermission
  ) => {
    const isAlreadyGranted = Object.prototype.hasOwnProperty.call(grantedPermissions, participantId);
    const currentGrantedCount = Object.keys(grantedPermissions).filter(
      (id) => grantedPermissions[id].audio || grantedPermissions[id].video
    ).length;
    if (!isAlreadyGranted && currentGrantedCount >= 3) return;

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
    const tileClass = isSharingScreen && isLocal ? "grid-slot screen-share-adjust" : "grid-slot";
    return (
      <div
        key={participantId}
        className={tileClass}
        onClick={() => {
          setExpandedParticipantId(participantId);
          setIsFullScreen(true); // Activate fullscreen when a tile is clicked
        }}
        style={{ cursor: "pointer" }}
      >
        <DailyVideo
          sessionId={participantId}
          type={isSharingScreen && isLocal ? "screenVideo" : "video"}
          autoPlay
          muted={isLocal} // Mute local video to prevent echo
        />
      </div>
    );
  };

  return (
    <div className="meeting-content" style={{ zIndex: meetingZIndex }}>
      {/* Video Grid Container */}
      <div className="video-grid-container">
        <ActiveVideoGrid activeParticipants={activeParticipants} renderTile={renderTile} />
      </div>

      {/* Meeting Controls */}
      <MeetingControls
        onStopMeeting={onStop}  // Use the onStop prop passed from MeetingApp
        isSharingScreen={isSharingScreen}
        onToggleShare={() => (isSharingScreen ? stopScreenShare() : startScreenShare())}
        showParticipants={showParticipants}
        onToggleParticipants={() => setShowParticipants(prev => !prev)}
      />

      {/* Participant List */}
      {showParticipants && (
        <ParticipantList onPermissionChange={handlePermissionChange} grantedPermissions={grantedPermissions} />
      )}

      {/* Expanded Video Overlay */}
      {expandedParticipantId && (
        <div className={`expanded-video-overlay ${isFullScreen ? "fullscreen" : ""}`}>
          <div className="participant-grid one-tile">
            <div className="grid-slot">
              <DailyVideo
                sessionId={expandedParticipantId}
                type={isSharingScreen && expandedParticipantId === localSessionId ? "screenVideo" : "video"}
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
              setIsFullScreen(false);
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
