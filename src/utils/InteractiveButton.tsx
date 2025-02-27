// InteractiveButton.tsx
import React from "react";
import "../css/InteractiveButton.css";

interface InteractiveButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean; // Added disabled prop
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  onClick,
  children,
  className = "",
  style,
  disabled = false,
}) => {
  return (
    <button
      className={`interactive-button ${className}`}
      onClick={onClick}
      style={style}
      disabled={disabled} // Pass the disabled prop to the button element
    >
      {children}
    </button>
  );
};

export default InteractiveButton;
