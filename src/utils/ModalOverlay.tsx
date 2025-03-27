import React from "react";
import "../css/ModalOverlay.css";

interface ModalOverlayProps {
  isVisible: boolean;
  zIndex?: number;
  onClose?: () => void;
  children: React.ReactNode;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({
  isVisible,
  zIndex,
  onClose,
  children,
}) => {
  if (!isVisible) return null;
  return (
    <div className="modal-overlay" style={{ zIndex }}>
      <div className="modal-content">
        {onClose && (
          <button className="modal-close-button ai-style-change-1" onClick={onClose}>
            <span className="close-icon">×</span>
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default ModalOverlay;