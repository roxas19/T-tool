import React, { useEffect, useRef, useState } from 'react';
import './WebcamDisplay.css';

const WebcamDisplay: React.FC = () => {
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setVideoStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };
    
        startWebcam();
    
        // Stop the webcam stream when the component unmounts
        return () => {
            videoStream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    return (
        <div className="webcam-container">
            <video ref={videoRef} autoPlay muted className="webcam-video" />
        </div>
    );
};

export default WebcamDisplay;
