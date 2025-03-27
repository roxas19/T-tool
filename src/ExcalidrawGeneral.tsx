import React, { useState, useEffect } from "react";
import ExcalidrawCanvas from "./Excalidraw/ExcalidrawCanvas";
import ExcalidrawToolbar from "./Excalidraw/ExcalidrawToolbar";
import "./css/Excalidraw.css";

// Import specialized hooks:
import { useOverlayManager } from "./context/OverlayManagerContext";
import { usePdfContext } from "./context/PdfContext";
import { useRealViewContext } from "./context/RealViewContext";
import { useMeetingContext } from "./context/MeetingContext";

const ExcalidrawGeneral: React.FC = () => {
  const { overlayState } = useOverlayManager();
  const displayMode = overlayState.displayMode; // "regular" or "draw"
  const overlayZIndices = overlayState.overlayZIndices;

  // Get PDF viewer state from PdfContext.
  const { pdfState } = usePdfContext();
  const pdfViewerActive = pdfState.isViewerActive;

  // Get RealView state from RealViewContext.
  const { realViewState } = useRealViewContext();
  const realViewActive = realViewState.isStreamMode;

  // Get meeting state from MeetingContext.
  const { meetingState } = useMeetingContext();

  // Local state for the built-in "island" (editor panel)
  const [isIslandVisible, setIsIslandVisible] = useState<boolean>(true);
  // Local state for the currently selected tool.
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // State to track if any overlay is active
  const [isAnyOverlayActive, setIsAnyOverlayActive] = useState<boolean>(false);

  // Recompute isAnyOverlayActive whenever relevant states change
  useEffect(() => {
    const isMeetingActive = meetingState.isActive;
    const newIsAnyOverlayActive = pdfViewerActive || realViewActive || isMeetingActive;

    console.log("Recomputing isAnyOverlayActive:");
    console.log("  pdfViewerActive:", pdfViewerActive);
    console.log("  realViewActive:", realViewActive);
    console.log("  meetingState.isActive:", meetingState.isActive);
    console.log("  isMeetingActive:", isMeetingActive);
    console.log("  newIsAnyOverlayActive:", newIsAnyOverlayActive);

    setIsAnyOverlayActive(newIsAnyOverlayActive);
  }, [pdfViewerActive, realViewActive, meetingState.isActive]);

  // We hide ExcalidrawGeneral when any overlay is active and we're not in draw mode.
  const shouldHideExcalidraw = isAnyOverlayActive && displayMode !== "draw";

  console.log("Rendering ExcalidrawGeneral:");
  console.log("  displayMode:", displayMode);
  console.log("  isAnyOverlayActive:", isAnyOverlayActive);
  console.log("  shouldHideExcalidraw:", shouldHideExcalidraw);
  console.log("  isIslandVisible:", isIslandVisible);

  const handleToolSelect = (tool: string) => {
    console.log("Tool selected:", tool);
    setSelectedTool(tool);
  };

  const toggleIslandVisibility = () => {
    setIsIslandVisible((prev) => {
      const newVisibility = !prev;
      console.log("Toggling island visibility:", newVisibility);
      return newVisibility;
    });
  };

  // Build the container class based on the current state.
  const containerClass = `excalidraw-general ${
    shouldHideExcalidraw ? "excalidraw-hidden" : ""
  } ${!isIslandVisible ? "hide-island" : ""} ${
    displayMode === "draw" ? "excalidraw-draw-active" : ""
  }`;

  console.log("Computed containerClass:", containerClass);

  // Apply the overlay z-index when in draw mode.
  const containerStyle: React.CSSProperties = {
    height: "100%",
    ...(displayMode === "draw" && { zIndex: overlayZIndices.overlay }),
  };

  console.log("Computed containerStyle:", containerStyle);

  return (
    <div className={containerClass} style={containerStyle}>
      {/* Toggle button for the built-in island editor */}
      <button className="excalidraw-toggle-btn" onClick={toggleIslandVisibility}>
        {isIslandVisible ? "Hide Island" : "Show Island"}
      </button>
      <ExcalidrawCanvas />
      <ExcalidrawToolbar
        className={`custom-toolbar ${displayMode === "draw" ? "stream-toolbar" : ""}`}
        onToolSelect={handleToolSelect}
      />
    </div>
  );
};

export default ExcalidrawGeneral;