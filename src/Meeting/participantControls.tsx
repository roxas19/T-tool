// participantControls.tsx
import React, { useState } from "react";
import { useParticipant, useParticipantIds } from "@daily-co/daily-react";
import "../css/MeetingApp.css";

export interface ParticipantPermission {
  audio: boolean;
  video: boolean;
}

export interface ParticipantItemProps {
  participantId: string;
  onPermissionChange: (participantId: string, permission: ParticipantPermission) => void;
  granted?: ParticipantPermission;
}

export const ParticipantItem: React.FC<ParticipantItemProps> = ({ participantId, onPermissionChange, granted }) => {
  const participant = useParticipant(participantId);
  const [showControls, setShowControls] = useState(false);
  const [permission, setPermission] = useState<ParticipantPermission>(granted || { audio: false, video: false });

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const toggleAudio = () => {
    const newPermission = { ...permission, audio: !permission.audio };
    setPermission(newPermission);
    onPermissionChange(participantId, newPermission);
  };

  const toggleVideo = () => {
    const newPermission = { ...permission, video: !permission.video };
    setPermission(newPermission);
    onPermissionChange(participantId, newPermission);
  };

  return (
    <li
      onClick={toggleControls}
      style={{ cursor: "pointer", padding: "8px", borderBottom: "1px solid #ccc" }}
    >
      <div>
        <span>
          {participant?.user_name || "Guest"} {participant?.local && "(You)"}
        </span>
        {participant?.tracks.audio?.state === "off" && <span className="muted"> 🔇</span>}
        {participant?.tracks.video?.state === "off" && <span className="muted"> 📷 Off</span>}
        {participant?.screen && <span> 🖥️ Sharing Screen</span>}
      </div>
      {showControls && (
        <div className="grant-controls" style={{ marginTop: "5px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleAudio();
            }}
            className="control-button"
          >
            {permission.audio ? "Revoke Audio" : "Grant Audio"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleVideo();
            }}
            className="control-button"
          >
            {permission.video ? "Revoke Video" : "Grant Video"}
          </button>
        </div>
      )}
    </li>
  );
};

export interface ParticipantListProps {
  onPermissionChange: (participantId: string, permission: ParticipantPermission) => void;
  grantedPermissions: { [id: string]: ParticipantPermission };
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ onPermissionChange, grantedPermissions }) => {
  // ParticipantList now uses Daily's hook to fetch participant IDs internally.
  const participantIds = useParticipantIds();

  return (
    <div className="participant-list">
      <h3>Participants</h3>
      <ul>
        {participantIds.map((id) => (
          <ParticipantItem
            key={id}
            participantId={id}
            onPermissionChange={onPermissionChange}
            granted={grantedPermissions[id]}
          />
        ))}
      </ul>
    </div>
  );
};
