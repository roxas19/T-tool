import React, { useRef, useEffect, useState } from "react";
import "./css/VideoPlayer.css";

type VideoPlayerProps = {
  playbackMode: "youtube" | "local"; // Playback mode: YouTube or Local Video
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playbackMode }) => {
  const [currentPlaybackMode, setCurrentPlaybackMode] = useState<"youtube" | "local">(playbackMode);
  const [localVideoFile, setLocalVideoFile] = useState<File | null>(null); // State for local video file
  const playerRef = useRef<any>(null); // Reference for the YouTube Player
  const videoRef = useRef<HTMLVideoElement | null>(null); // Reference for local video playback

  // Load the YouTube IFrame Player API when the component is in YouTube mode
  useEffect(() => {
    if (currentPlaybackMode === "youtube") {
      loadYouTubeAPI();
    }

    // Cleanup YouTube player if mode changes
    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [currentPlaybackMode]);

  const loadYouTubeAPI = () => {
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onload = () => {
        if (window.YT && window.YT.ready) {
          window.YT.ready(() => initYouTubePlayer());
        }
      };
      document.body.appendChild(script);
    } else {
      initYouTubePlayer();
    }
  };

  const initYouTubePlayer = () => {
    if (playerRef.current) return; // Avoid reinitializing

    playerRef.current = new window.YT.Player("player", {
      videoId: "dQw4w9WgXcQ", // Replace with your test video ID
      playerVars: { enablejsapi: 1, controls: 1, rel: 0, origin: "http://localhost:3000" },
    });
  };

  const handlePlay = () => {
    if (currentPlaybackMode === "youtube") {
      playerRef.current?.playVideo();
    } else if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handlePause = () => {
    if (currentPlaybackMode === "youtube") {
      playerRef.current?.pauseVideo();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLocalVideoFile(file);
      console.log("Local video uploaded:", file.name);
    }
  };

  const togglePlaybackMode = () => {
    setCurrentPlaybackMode((prevMode) => {
      if (prevMode === "youtube" && playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setLocalVideoFile(null); // Clear any previously loaded local video
      return prevMode === "youtube" ? "local" : "youtube";
    });
  };

  return (
    <div className="video-player-wrapper">
      {currentPlaybackMode === "youtube" ? (
        <div id="player" className="youtube-player"></div>
      ) : (
        <div className="local-video-player">
          {localVideoFile ? (
            <video
              ref={videoRef}
              className="video-player"
              controls
              src={URL.createObjectURL(localVideoFile)}
              onError={(e) => console.error("Error loading local video:", e)}
            />
          ) : (
            <div className="video-upload-placeholder">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ display: "block", marginBottom: "10px" }}
              />
              <p>Upload a video to play locally.</p>
            </div>
          )}
        </div>
      )}
      <div className="video-player-controls">
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={togglePlaybackMode}>
          Switch to {currentPlaybackMode === "youtube" ? "Local Video" : "YouTube"} Mode
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
