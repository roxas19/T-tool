
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

  // State management
  const [grantedPermissions, setGrantedPermissions] = useState<Record<string, ParticipantPermission>>({});
  const [showParticipants, setShowParticipants] = useState(false);
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Memoized values
  const grantedParticipantIds = useMemo(() => {
    return Object.entries(grantedPermissions)
      .filter(([_, permission]) => permission.audio || permission.video)
      .map(([id]) => id);
  }, [grantedPermissions]);

  const activeParticipants = useMemo(() => {
    if (!localSessionId) return grantedParticipantIds.slice(0, 4);
    return [localSessionId, ...grantedParticipantIds].slice(0, 4);
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
            daily.setLocalVideo(true)
          ]);
        }
      } catch (error) {
        console.error("Failed to join meeting:", error);
      }
    };

    initializeMeeting();
    return () => { cancelled = true; };
  }, [daily, roomUrl]);

  // Callbacks
  const handlePermissionChange = useCallback((
    participantId: string,
    permission: ParticipantPermission
  ) => {
    setGrantedPermissions(prev => {
      const currentGrantedCount = Object.keys(prev).length;
      const isAlreadyGranted = participantId in prev;
      
      if (!isAlreadyGranted && currentGrantedCount >= 3) return prev;

      const newPermissions = {
        ...prev,
        [participantId]: permission
      };

      daily?.sendAppMessage({
        type: "PERMISSION_UPDATE",
        participantId,
        ...permission
      }, "*");

      return newPermissions;
    });
  }, [daily]);

  const renderTile = useCallback((participantId: string, tileClass: string) => {
    return (
        <div key={participantId} className={tileClass} onClick={() => { setExpandedParticipantId(participantId); setIsFullScreen(true); }} style={{ cursor: "pointer" }} >
            <DailyVideo
                sessionId={participantId}
                type={isSharingScreen && participantId === localSessionId ? "screenVideo" : "video"}
                autoPlay
                muted={participantId === localSessionId}
            />
        </div>
    );
  }, [localSessionId, isSharingScreen]);

  const handleCloseExpanded = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedParticipantId(null);
    setIsFullScreen(false);
  }, []);

  return (
    <>
      <div className="meeting-content" style={{ zIndex: overlayState.overlayZIndices.overlay }}>
        <div className="video-grid-container">
            <div className="participant-grid ai-style-change-2">
                {activeParticipants.map((participantId) => {
                    const isLocal = participantId === localSessionId;
                    const tileClass = isSharingScreen && isLocal ? "grid-slot screen-share-adjust ai-style-change-1" : "grid-slot ai-style-change-1";
                    return renderTile(participantId, tileClass)
                })}
            </div>
        </div>

        <MeetingControls
          onStopMeeting={onStop}
          isSharingScreen={isSharingScreen}
          onToggleShare={() => isSharingScreen ? stopScreenShare() : startScreenShare()}
          showParticipants={showParticipants}
          onToggleParticipants={() => setShowParticipants(prev => !prev)}
        />

        {showParticipants && (
          <ParticipantList 
            onPermissionChange={handlePermissionChange} 
            grantedPermissions={grantedPermissions} 
          />
        )}
      </div>

      {expandedParticipantId && (
        <div 
          className={`expanded-video-overlay ${isFullScreen ? "fullscreen" : ""}`}
          style={{ zIndex: overlayState.overlayZIndices.overlay }}
          onClick={handleCloseExpanded}
        >
          <div className="expanded-video-container" onClick={e => e.stopPropagation()}>
            <div className="expanded-video-wrapper">
              <DailyVideo
                sessionId={expandedParticipantId}
                type={isSharingScreen && expandedParticipantId === localSessionId ? "screenVideo" : "video"}
                autoPlay
                muted={expandedParticipantId === localSessionId}
              />
            </div>
            <button
              className="close-expanded"
              onClick={handleCloseExpanded}
              aria-label="Minimize expanded view"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(MeetingUI);