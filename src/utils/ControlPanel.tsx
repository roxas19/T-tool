// ControlPanel.tsx
import React from "react";
import "../css/ControlPanel.css";

export interface ControlPanelProps {
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  extraContent?: React.ReactNode;
  containerClassName?: string;
  style?: React.CSSProperties;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  leftContent,
  centerContent,
  rightContent,
  extraContent,
  containerClassName = "",
  style,
}) => {
  return (
    <div className={`control-panel ${containerClassName}`} style={style}>
      <div className="control-panel-left-box">
        {leftContent}
      </div>
      <div className="control-panel-center-box">
        {centerContent}
      </div>
      <div className="control-panel-right-box">
        {rightContent}
      </div>
      {extraContent && (
        <div className="control-panel-extra">
          {extraContent}
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
