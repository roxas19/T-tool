// ExcalidrawElementEditor.tsx
import React, { useState, useEffect } from "react";
import { useGlobalUI } from "../context/GlobalUIContext";
import "../css/ExcalidrawElementEditor.css";

interface ExcalidrawElementEditorProps {
  selectedElement: any; // Must be non-null when rendered.
  onClose: () => void;
}

const ExcalidrawElementEditor: React.FC<ExcalidrawElementEditorProps> = ({
  selectedElement,
  onClose,
}) => {
  const { excalidrawAPI } = useGlobalUI();

  // Local state for editable properties.
  const [strokeColor, setStrokeColor] = useState<string>("#000000");
  const [fillColor, setFillColor] = useState<string>("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState<number>(1);

  // Update local state when a new element is selected.
  useEffect(() => {
    if (selectedElement) {
      setStrokeColor(selectedElement.strokeColor || "#000000");
      setFillColor(selectedElement.fillColor || "#ffffff");
      setStrokeWidth(selectedElement.strokeWidth || 1);
    }
  }, [selectedElement]);

  // Handle "Apply Changes" by updating the selected element.
  const handleApplyChanges = () => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const updatedElements = elements.map((el: any) =>
      el.id === selectedElement.id
        ? { ...el, strokeColor, fillColor, strokeWidth }
        : el
    );
    excalidrawAPI.updateScene({ elements: updatedElements });
  };

  return (
    <div className="excalidraw-element-editor">
      <div className="header">
        <h3>Edit Element</h3>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="field">
        <label>Stroke Color:</label>
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Fill Color:</label>
        <input
          type="color"
          value={fillColor}
          onChange={(e) => setFillColor(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Stroke Width:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
        />
        <span className="range-value">{strokeWidth}</span>
      </div>

      <button className="apply-btn" onClick={handleApplyChanges}>
        Apply Changes
      </button>
    </div>
  );
};

export default ExcalidrawElementEditor;
