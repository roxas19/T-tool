// ActiveVideoGrid.tsx
import React from "react";
import "../css/MeetingApp.css";

interface ActiveVideoGridProps {
  activeParticipants: string[];
  renderTile: (participantId: string, index: number) => JSX.Element;
}

const ActiveVideoGrid: React.FC<ActiveVideoGridProps> = ({ activeParticipants, renderTile }) => {
  // Compute grid styles based on the number of active participants.
  let gridStyle: React.CSSProperties = {};

  switch (activeParticipants.length) {
    case 1:
      gridStyle = {
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr",
        height: "80vh",
        gap: "20px",
      };
      break;
    case 2:
      gridStyle = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr",
        height: "80vh",
        gap: "20px",
      };
      break;
    case 3:
      // For three participants, use a two-row layout with the third tile spanning two columns.
      gridStyle = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        height: "80vh",
        gap: "20px",
      };
      break;
    default:
      // Four or more participants: use a standard 2×2 grid.
      gridStyle = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        height: "80vh",
        gap: "20px",
      };
      break;
  }

  return (
    <div className="participant-grid" style={gridStyle}>
      {activeParticipants.map((participantId, index) => {
        // If there are exactly 3 participants, make the third tile span two columns.
        const extraStyle: React.CSSProperties = {};
        if (activeParticipants.length === 3 && index === 2) {
          extraStyle.gridColumn = "1 / span 2";
        }
        return (
          <div key={participantId} style={extraStyle}>
            {renderTile(participantId, index)}
          </div>
        );
      })}
    </div>
  );
};

export default ActiveVideoGrid;
