import React, { useRef, ChangeEvent } from "react";
import { usePdfContext } from "../context/PdfContext";
import { useRealViewContext } from "../context/RealViewContext";
import { useMeetingContext } from "../context/MeetingContext";
import { useOverlayManager } from "../context/OverlayManagerContext";
import { useRecording } from "../Recorder/useRecording";
import { useMeetingControls } from "../MeetingApp";
import DropdownButton from "../utils/DropdownButton";
import MainToolbarButton from "./MainToolbarButton";
import "./MainToolbar.css";

type MainToolbarProps = {
  onPdfUpload: (file: File) => void;
  isSmallWebcamActive: boolean;
  onToggleSmallWebcam: () => void;
};

const MainToolbar: React.FC<MainToolbarProps> = ({
  onPdfUpload,
  isSmallWebcamActive,
  onToggleSmallWebcam,
}) => {
  const { pdfState, pdfDispatch } = usePdfContext();
  const { realViewState, realViewDispatch } = useRealViewContext();
  const { meetingState, meetingDispatch } = useMeetingContext();
  const { overlayState, overlayDispatch } = useOverlayManager();
  const { isRecording, toggleRecording, downloadLast15Minutes } = useRecording();

  const { handleStopMeeting } = useMeetingControls();

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const activeOverlay = overlayState.activeStack.at(-1);

  // For PDF:
  const isPdfOpen = pdfState.isViewerActive;
  const isPdfActive = activeOverlay === "pdf";
  // For RealView:
  const isRealOpen = realViewState.on && realViewState.isStreamMode;
  const isRealActive = activeOverlay === "realview";
  // For Meeting:
  const isMeetingActive = activeOverlay === "meeting";
  const isMeetingMinimized = meetingState.isActive && !isMeetingActive;

  const triggerFileUpload = () => pdfInputRef.current?.click();

  const handlePdfButtonClick = () => {
    if (isPdfActive) {
      pdfDispatch({ type: "CLOSE_PDF_VIEWER" });
      overlayDispatch({ type: "POP_OVERLAY" });
    } else if (isPdfOpen) {
      overlayDispatch({ type: "PUSH_OVERLAY", payload: "pdf" });
    } else {
      triggerFileUpload();
    }
  };

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfUpload(file);
      e.target.value = "";
    }
  };

  const handleRealViewToggle = () => {
    if (isRealActive) {
      realViewDispatch({ type: "SET_REALVIEW_STREAM_MODE", payload: false });
      realViewDispatch({ type: "SET_REALVIEW_ON", payload: false });
      overlayDispatch({ type: "POP_OVERLAY" });
    } else if (isRealOpen) {
      overlayDispatch({ type: "PUSH_OVERLAY", payload: "realview" });
    } else {
      realViewDispatch({ type: "SET_REALVIEW_STREAM_MODE", payload: true });
      realViewDispatch({ type: "SET_REALVIEW_ON", payload: true });
      overlayDispatch({ type: "PUSH_OVERLAY", payload: "realview" });
    }
  };

  const handleMeetingToggle = async () => {
    // When meeting is active and the "meeting" overlay is on top,
    // the button label shows "Exit Meeting" so we call the shared stop handler.
    if (meetingState.isActive && isMeetingActive) {
      await handleStopMeeting();
    } else if (meetingState.isActive && !isMeetingActive) {
      // Meeting is running but minimized so bring the overlay to the front.
      overlayDispatch({ type: "PUSH_OVERLAY", payload: "meeting" });
    } else {
      // Otherwise, starting a new meeting.
      meetingDispatch({ type: "OPEN_MEETING" });
      overlayDispatch({ type: "PUSH_OVERLAY", payload: "meeting" });
    }
  };

  return (
    <div className="main-toolbar">
      {/* PDF Toggle Button */}
      <MainToolbarButton
        active={isPdfActive}
        className={!isPdfActive && isPdfOpen ? "switch-active" : ""}
        onClick={handlePdfButtonClick}
      >
        {isPdfActive ? "Exit PDF" : isPdfOpen ? "Switch to PDF" : "Upload PDF"}
      </MainToolbarButton>
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        style={{ display: "none" }}
      />

      {/* Webcam Toggle Button */}
      <MainToolbarButton onClick={onToggleSmallWebcam} active={isSmallWebcamActive}>
        {isSmallWebcamActive ? "Webcam Off" : "Webcam On"}
      </MainToolbarButton>

      {/* RealView Toggle Button */}
      <MainToolbarButton
        active={isRealActive}
        className={!isRealActive && isRealOpen ? "switch-active" : ""}
        onClick={handleRealViewToggle}
      >
        {isRealActive ? "Exit Real View" : isRealOpen ? "Switch to Real View" : "Real View"}
      </MainToolbarButton>

      {/* Recording Button (Dropdown) */}
      <DropdownButton
        isActive={isRecording}
        activeText="Stop Recording"
        inactiveText="Start Recording"
        onToggle={toggleRecording}
      >
        <MainToolbarButton onClick={downloadLast15Minutes}>
          Download Last 15 Minutes
        </MainToolbarButton>
      </DropdownButton>

      {/* Meeting Button */}
      <MainToolbarButton
        active={isMeetingActive}
        className={!isMeetingActive && isMeetingMinimized ? "switch-active" : ""}
        onClick={handleMeetingToggle}
      >
        {isMeetingActive
          ? "Exit Meeting"
          : isMeetingMinimized
          ? "Switch to Meeting"
          : "Start Meeting"}
      </MainToolbarButton>
    </div>
  );
};

export default MainToolbar;