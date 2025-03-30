import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  useDaily,
  useLocalSessionId,
  DailyVideo,
  useScreenShare,
} from "@daily-co/daily-react";
import { ParticipantList, ParticipantPermission } from "./participantControls";
import MeetingControls from "./MeetingControls";
import { useOverlayManager } from "../context/OverlayManagerContext";
import "../css/MeetingApp.css";

export interface MeetingUIProps {
  roomUrl: string;
  onStop: () => void;
  meetingName: string;
}

const MeetingUI: React.FC<MeetingUIProps> = ({ roomUrl, onStop, meetingName }) => {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();
  const { overlayState } = useOverlayManager();

  // Manage granted permissions without a cap
  const [grantedPermissions, setGrantedPermissions] = useState<Record<string, ParticipantPermission>>({});

  // List of participant IDs with granted audio/video permissions
  const grantedParticipantIds = useMemo(() => {
    return Object.entries(grantedPermissions)
      .filter(([_, permission]) => permission.audio || permission.video)
      .map(([id]) => id);
  }, [grantedPermissions]);

  // Active participants include the local participant plus granted ones
  const activeParticipants = useMemo(() => {
    return localSessionId
      ? Array.from(new Set([localSessionId, ...grantedParticipantIds]))
      : grantedParticipantIds;
  }, [localSessionId, grantedParticipantIds]);

  // Meeting initialization
  useEffect(() => {
    if (!daily || !roomUrl) return;
    let cancelled = false;
    const initializeMeeting = async () => {
      try {
        await daily.join({ url: roomUrl });
        if (!cancelled) {
          await Promise.all([
            daily.setLocalAudio(true),
            daily.setLocalVideo(true),
          ]);
        }
      } catch (error) {
        console.error("Failed to join meeting:", error);
      }
    };
    initializeMeeting();
    return () => { cancelled = true; };
  }, [daily, roomUrl]);

  // Permission change handler
  const handlePermissionChange = useCallback(
    (participantId: string, permission: ParticipantPermission) => {
      setGrantedPermissions((prev) => {
        const newPermissions = {
          ...prev,
          [participantId]: permission,
        };

        daily?.sendAppMessage(
          {
            type: "PERMISSION_UPDATE",
            participantId,
            ...permission,
          },
          "*"
        );
        return newPermissions;
      });
    },
    [daily]
  );

  // Render a participant tile
  const renderTile = useCallback(
    (participantId: string, tileClass: string) => (
      <div key={participantId} className={tileClass}>
        <DailyVideo
          sessionId={participantId}
          type={isSharingScreen && participantId === localSessionId ? "screenVideo" : "video"}
          autoPlay
          muted={participantId === localSessionId}
        />
      </div>
    ),
    [localSessionId, isSharingScreen]
  );

  return (
    <div className="meeting-wrapper">
      <div className="meeting-container">
        <div className="video-grid-container">
          <div className="participant-grid ai-style-change-2">
            {activeParticipants.map((participantId) => {
              const isLocal = participantId === localSessionId;
              const tileClass =
                isSharingScreen && isLocal
                  ? "grid-slot screen-share-adjust ai-style-change-1"
                  : "grid-slot ai-style-change-1";
              return renderTile(participantId, tileClass);
            })}
          </div>
        </div>
        
      </div>
      <div className="side-panel">
        <ParticipantList
          onPermissionChange={handlePermissionChange}
          grantedPermissions={grantedPermissions}
        />
      </div>
      <MeetingControls
          onStopMeeting={onStop}
          isSharingScreen={isSharingScreen}
          onToggleShare={() =>
            isSharingScreen ? stopScreenShare() : startScreenShare()
          }
        />
    </div>
  );
};

export default React.memo(MeetingUI);