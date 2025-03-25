// src/components/DropdownButton/DropdownButton.tsx
import React, { useState } from "react";
import "../css/DropdownButton.css";

export interface DropdownButtonProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  onToggle: () => void;
  children?: React.ReactNode; // Dropdown content
  className?: string;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  isActive,
  activeText = "Active",
  inactiveText = "Inactive",
  onToggle,
  children,
  className = "",
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`dropdown-button-container ${className} ${hover ? "hover" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button className={`dropdown-button ${isActive ? "active" : ""}`} onClick={onToggle}>
        {isActive ? (hover ? activeText : inactiveText) : inactiveText}
      </button>
      {isActive && children && (
        <div className="dropdown-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
