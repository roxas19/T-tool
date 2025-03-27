
import React from "react";
import "../css/MeetingApp.css";

interface ActiveVideoGridProps {
  activeParticipants: string[];
  renderTile: (participantId: string, tileClass: string) => JSX.Element;
}

const ActiveVideoGrid: React.FC<ActiveVideoGridProps> = ({ activeParticipants, renderTile }) => {
  return null;
};

export default ActiveVideoGrid;