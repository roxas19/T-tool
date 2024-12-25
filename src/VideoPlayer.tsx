import React, { useRef, useEffect } from "react";
import "./VideoPlayer.css"; // Import CSS for styling

const VideoPlayer: React.FC = () => {
  const playerRef = useRef<any>(null); // Reference for the YouTube Player

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        // Dynamically load the YouTube IFrame Player API script
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.onload = () => {
          if (window.YT && window.YT.ready) {
            window.YT.ready(() => {
              initPlayer();
            });
          }
        };
        document.body.appendChild(script);
      } else {
        initPlayer();
      }
    };

    const initPlayer = () => {
      if (playerRef.current && typeof playerRef.current !== "string") {
        return; // Avoid reinitializing if the player already exists
      }

      // Initialize the YouTube Player
      playerRef.current = new window.YT.Player("player", {
        videoId: "dQw4w9WgXcQ", // Replace with your test video ID
        playerVars: {
          enablejsapi: 1, // Enables API control
          controls: 1, // Shows native YouTube controls
          rel: 0, // Prevent showing related videos
        },
        events: {
          onReady: () => console.log("Player is ready"),
        },
      });
    };

    loadYouTubeAPI();

    // Cleanup function to destroy the player on unmount
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null; // Reset the reference
      }
    };
  }, []);

  const handlePlay = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo(); // Play the video
    } else {
      console.warn("Player not ready to play.");
    }
  };

  const handlePause = () => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo(); // Pause the video
    } else {
      console.warn("Player not ready to pause.");
    }
  };

  return (
    <div
      className="video-player-wrapper"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Placeholder for the YouTube player */}
      <div id="player" className="video-player"></div>

      {/* Basic controls */}
      <div className="video-player-controls">
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
      </div>
    </div>
  );
};

export default VideoPlayer;
