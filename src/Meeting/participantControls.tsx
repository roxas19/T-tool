// participantControls.tsx
import React from "react";
import { useParticipant, useParticipantIds } from "@daily-co/daily-react";
import "../css/MeetingApp.css";

export const ParticipantItem: React.FC<{ participantId: string }> = ({ participantId }) => {
  const participant = useParticipant(participantId);

  return (
    <li key={participantId}>
      <span>
        {participant?.user_name || "Guest"} {participant?.local && "(You)"}
      </span>
      {participant?.tracks.audio?.state === "off" && <span className="muted">🔇</span>}
      {participant?.tracks.video?.state === "off" && <span className="muted">📷 Off</span>}
      {participant?.screen && <span>🖥️ Sharing Screen</span>}
    </li>
  );
};

export const ParticipantList: React.FC = () => {
  const participantIds = useParticipantIds();

  return (
    <div className="participant-list">
      <h3>Participants</h3>
      <ul>
        {participantIds.map((id) => (
          <ParticipantItem key={id} participantId={id} />
        ))}
      </ul>
    </div>
  );
};
