// MediaToggleContext.tsx
import React, { createContext, useContext, useState } from "react";
import { useDaily } from "@daily-co/daily-react";

interface MediaToggleContextType {
  isHostAudioOn: boolean;
  isHostVideoOn: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

const MediaToggleContext = createContext<MediaToggleContextType | undefined>(undefined);

export const MediaToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const daily = useDaily();
  const [isHostAudioOn, setIsHostAudioOn] = useState(true);
  const [isHostVideoOn, setIsHostVideoOn] = useState(true);

  const toggleAudio = () => {
    const newAudioState = !isHostAudioOn;
    setIsHostAudioOn(newAudioState);
    if (daily) {
      daily.setLocalAudio(newAudioState);
    }
  };

  const toggleVideo = () => {
    const newVideoState = !isHostVideoOn;
    setIsHostVideoOn(newVideoState);
    if (daily) {
      daily.setLocalVideo(newVideoState);
    }
  };

  return (
    <MediaToggleContext.Provider value={{ isHostAudioOn, isHostVideoOn, toggleAudio, toggleVideo }}>
      {children}
    </MediaToggleContext.Provider>
  );
};

export const useMediaToggleContext = () => {
  const context = useContext(MediaToggleContext);
  if (!context) {
    throw new Error("useMediaToggleContext must be used within a MediaToggleProvider");
  }
  return context;
};
