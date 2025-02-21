import { useState, useEffect } from "react";

export const useWebcamManager = () => {
  const [webcamOn, setWebcamOn] = useState(false);
  const [isStreamMode, setIsStreamMode] = useState(false);
  const [isWebcamOverlayVisible, setWebcamOverlayVisible] = useState(false);

  const toggleWebcam = () => {
    if (webcamOn) {
      setWebcamOn(false);
      setWebcamOverlayVisible(false);
    } else {
      setWebcamOn(true);
      setWebcamOverlayVisible(true);
    }
  };

  useEffect(() => {
    if (!webcamOn) {
      setWebcamOverlayVisible(false);
    } else if (!isStreamMode) {
      setWebcamOverlayVisible(true);
    }
  }, [webcamOn, isStreamMode]);

  return {
    webcamOn,
    isStreamMode,
    isWebcamOverlayVisible,
    setWebcamOn,
    setIsStreamMode,
    setWebcamOverlayVisible,
    toggleWebcam,
  };
};
