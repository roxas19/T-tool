// ExcalidrawGeneral.tsx
import React, { useState } from "react";
import { useGlobalUI } from "./context/GlobalUIContext";
import ExcalidrawCanvas, { CustomExcalidrawAPI } from "./Excalidraw/ExcalidrawCanvas";
import ExcalidrawToolbar from "./Excalidraw/ExcalidrawToolbar";

const ExcalidrawGeneral: React.FC = () => {
  const { displayMode } = useGlobalUI();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  return (
    <div className="excalidraw-general" style={{ height: "100%", position: "relative" }}>
      {/* Excalidraw Canvas handles the core drawing area and API initialization */}
      <ExcalidrawCanvas />

      {/* Excalidraw Toolbar provides tool controls, styled conditionally based on displayMode */}
      <ExcalidrawToolbar
        className={`custom-toolbar ${displayMode === "draw" ? "stream-toolbar" : ""}`}

        onToolSelect={(tool) => setSelectedTool(tool)}
      />
    </div>
  );
};

export default ExcalidrawGeneral;
