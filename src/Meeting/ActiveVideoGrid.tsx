// ActiveVideoGrid.tsx
import React from "react";
import "../css/MeetingApp.css";

interface ActiveVideoGridProps {
  activeParticipants: string[];
  renderTile: (participantId: string, index: number) => JSX.Element;
}

const ActiveVideoGrid: React.FC<ActiveVideoGridProps> = ({ activeParticipants, renderTile }) => {
  // Base grid style shared across layouts.
  const baseGridStyle: React.CSSProperties = {
    display: "grid",
    gap: "20px",
  };

  // Adjust grid template based on participant count.
  let gridTemplateStyles: React.CSSProperties = {};

  switch (activeParticipants.length) {
    case 1:
      gridTemplateStyles = {
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr",
      };
      break;
    case 2:
      gridTemplateStyles = {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr",
      };
      break;
    case 3:
      gridTemplateStyles = {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      };
      break;
    default:
      // Four or more participants: use a standard 2×2 grid.
      gridTemplateStyles = {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      };
      break;
  }

  // Merge base styles with template-specific styles.
  const gridStyle: React.CSSProperties = { ...baseGridStyle, ...gridTemplateStyles };

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
