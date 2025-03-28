import React from "react";
import { useParticipantIds } from "@daily-co/daily-react";
import ParticipantMiniBlock from "./ParticipantMiniBlock";
import "../css/MeetingApp.css";

// Keep existing permission interface
export interface ParticipantPermission {
  audio: boolean;
  video: boolean;
}

export interface ParticipantListProps {
  onPermissionChange: (participantId: string, permission: ParticipantPermission) => void;
  grantedPermissions: { [id: string]: ParticipantPermission };
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  onPermissionChange,
  grantedPermissions,
}) => {
  const participantIds = useParticipantIds();

  return (
    <div className="participant-list">
      <h3>Participants ({participantIds.length})</h3>
      <div className="participant-grid-container">
        {participantIds.map((id) => (
          <ParticipantMiniBlock
            key={id}
            participantId={id}
            currentPermissions={grantedPermissions[id] || { audio: false, video: false }}
            onPermissionChange={onPermissionChange}
          />
        ))}
      </div>
    </div>
  );
};

// Export for use in other components
export default ParticipantList;