// ModalOverlay.tsx
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
      <div className="modal-overlay-content">
        {onClose && (
          <button className="modal-overlay-close-button" onClick={onClose}>
            &times;
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default ModalOverlay;
