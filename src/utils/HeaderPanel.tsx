// HeaderPanel.tsx
import React from "react";
import "../css/HeaderPanel.css";

interface HeaderPanelProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const HeaderPanel: React.FC<HeaderPanelProps> = ({ leftContent, rightContent }) => {
  return (
    <>
      <div className="header-panel-circle header-panel-left">
        {leftContent}
      </div>
      <div className="header-panel-circle header-panel-right">
        {rightContent}
      </div>
    </>
  );
};

export default HeaderPanel;