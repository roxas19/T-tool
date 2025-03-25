// src/recording/Recording.tsx
import React from "react";
import { useRecording } from "./Recorder/useRecording";


const Recording: React.FC = () => {
  // Here we simply display a processing overlay if the recording is processing.
  // The hook also handles the recording state and actions.
  const { processing } = useRecording();

  return (
    <>
      {processing && (
        <div className="processing-overlay">
          <div className="processing-message">Processing video...</div>
        </div>
      )}
    </>
  );
};

export default Recording;
